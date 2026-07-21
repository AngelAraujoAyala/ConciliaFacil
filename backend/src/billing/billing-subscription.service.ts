import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPlan } from '@prisma/client';
import Stripe from 'stripe';

const PLAN_HIERARCHY: Record<UserPlan, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
};

const PRICE_TO_PLAN: Record<string, UserPlan> = {
  'price_1TpCWFRk8JjGytDbEsAY9wVo': UserPlan.BASIC,
  'price_1TqgASRk8JjGytDb5oegIhB0': UserPlan.PRO,
};

@Injectable()
export class BillingSubscriptionService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY no está definida en las variables de entorno.');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  /**
   * Consulta a Stripe una factura preliminar (upcoming invoice) para calcular
   * el monto exacto de la prorrata antes de ejecutar el upgrade.
   * No genera ningún cargo — es solo una consulta de preview.
   *
   * Stripe incluye en amount_due tanto las líneas de prorrata como el próximo
   * ciclo de renovación completo. Solo sumamos las líneas de prorrata para
   * mostrar al usuario el cargo inmediato real.
   *
   * @returns { amountDue: number, currency: string }
   *   amountDue  — monto neto de prorrata en centavos (puede ser 0 si hay crédito suficiente)
   *   currency   — código ISO de la moneda (ej. "mxn")
   */
  async previewUpgrade(userId: string, targetPriceId: string): Promise<{ amountDue: number; currency: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuario no encontrado.');
    if (!user.stripeSubscriptionId) throw new BadRequestException('No tienes una suscripción activa.');

    const subscription = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const currentItem = subscription.items.data[0];
    const prorationDate = Math.floor(Date.now() / 1000);

    const upcomingInvoice = await this.stripe.invoices.createPreview({
      customer: user.stripeCustomerId!,
      subscription: user.stripeSubscriptionId,
      subscription_details: {
        items: [
          {
            id: currentItem.id,
            price: targetPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
        proration_date: prorationDate,
      },
      expand: ['lines.data'],
    });

    // Stripe devuelve la factura completa (prorrata + próximo ciclo completo).
    // Filtramos solo las líneas de prorrata para obtener el cargo inmediato real.
    const prorationLines = upcomingInvoice.lines.data.filter(
      (line: any) => line.parent?.subscription_item_details?.proration === true,
    );

    const prorationAmount = prorationLines.reduce(
      (sum: number, line: any) => sum + line.amount,
      0,
    );

    console.log(
      `[previewUpgrade] amount_due total: ${upcomingInvoice.amount_due}, ` +
      `proration lines: ${prorationLines.length}, ` +
      `proration net: ${prorationAmount}`,
    );

    // El neto puede ser negativo si el crédito supera el cargo (ej. downgrade).
    // Para upgrades siempre debería ser positivo o cero.
    return {
      amountDue: Math.max(0, prorationAmount),
      currency: upcomingInvoice.currency,
    };
  }

  /**
   * Cancela la suscripción del usuario al final del ciclo de facturación actual.
   * El usuario sigue con acceso al plan hasta currentPeriodEnd, luego pasa a FREE.
   * No genera ningún reembolso.
   *
   * Maneja dos casos:
   * - Suscripción con Subscription Schedule activo (creado por downgrade PRO→BASIC):
   *   se cancela el schedule, lo que libera la suscripción y la marca para cancelar al fin del periodo.
   * - Suscripción libre (sin schedule):
   *   se actualiza directamente con cancel_at_period_end: true.
   */
  async cancelSubscription(userId: string): Promise<{ action: string; message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuario no encontrado.');
    if (!user.stripeSubscriptionId) {
      throw new BadRequestException('No tienes una suscripción activa para cancelar.');
    }
    if (user.cancelAtPeriodEnd && !user.pendingPriceId) {
      throw new BadRequestException('Tu suscripción ya tiene una cancelación programada.');
    }

    // Recuperar la suscripción para saber si está bajo el control de un schedule
    const subscription = await this.stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    const scheduleId = subscription.schedule as string | null;

    if (scheduleId) {
      // La suscripción está manejada por un Subscription Schedule (ej. downgrade PRO→BASIC pendiente).
      // NO llamamos a .cancel() porque eso cancela inmediatamente.
      // En cambio, actualizamos el schedule para que solo tenga la fase actual
      // y con end_behavior='cancel', lo que hace que se cancele AL TERMINAR el ciclo
      // actual sin renovar — el usuario conserva el acceso hasta currentPeriodEnd.
      const schedule = await this.stripe.subscriptionSchedules.retrieve(scheduleId);
      const currentPhase = schedule.phases[0];

      await this.stripe.subscriptionSchedules.update(scheduleId, {
        end_behavior: 'cancel',
        phases: [
          {
            start_date: currentPhase.start_date,
            end_date: currentPhase.end_date,
            items: currentPhase.items as any,
          },
        ],
      });
    } else {
      // Suscripción libre — se puede actualizar directamente
      await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Persistir inmediatamente sin esperar el webhook
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        cancelAtPeriodEnd: true,
        pendingPriceId: null, // Cancelación total → volverá a FREE
      },
    });

    return {
      action: 'CANCEL_SCHEDULED',
      message: 'Tu suscripción se cancelará al finalizar el ciclo de cobro. Seguirás disfrutando de tu plan hasta ese día.',
    };
  }

  async processPlanChange(userId: string, targetPriceId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const currentPlan = user.plan;
    const targetPlan = targetPriceId ? (PRICE_TO_PLAN[targetPriceId] || UserPlan.FREE) : UserPlan.FREE;

    // Si el usuario no tiene suscripción activa o quiere volver a FREE directamente
    if (!user.stripeSubscriptionId) {
      if (targetPlan === UserPlan.FREE) {
        throw new BadRequestException('Ya te encuentras en el Plan Gratis.');
      }
      // Redirigir a creación de checkout normal
      return { action: 'REDIRECT_CHECKOUT', targetPriceId };
    }

    const currentHierarchy = PLAN_HIERARCHY[currentPlan];
    const targetHierarchy = PLAN_HIERARCHY[targetPlan];

    if (currentHierarchy === targetHierarchy) {
      throw new BadRequestException('Estás intentando seleccionar tu mismo plan actual.');
    }

    const subscription = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // ==========================================
    // CASO A: UPGRADE (Inmediato con Prorrateo)
    // ==========================================
    if (targetHierarchy > currentHierarchy) {
      const subscriptionItemId = subscription.items.data[0].id;

      const updatedSubscription = await this.stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          proration_behavior: 'create_prorations',
          items: [
            {
              id: subscriptionItemId,
              price: targetPriceId!,
            },
          ],
        },
      );

      // current_period_end vive en los items en la API v2026-06-24.dahlia
      const newPeriodEnd = updatedSubscription.items.data[0]?.current_period_end;

      // Actualizamos base de datos inmediatamente sin esperar el webhook
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          plan: targetPlan,
          stripePriceId: targetPriceId,
          subscriptionStatus: updatedSubscription.status,
          cancelAtPeriodEnd: false,  // El upgrade cancela cualquier downgrade pendiente
          pendingPriceId: null,
          ...(newPeriodEnd && {
            currentPeriodEnd: new Date(newPeriodEnd * 1000),
            nextResetDate: new Date(newPeriodEnd * 1000),
          }),
        },
      });

      return {
        action: 'UPGRADE_SUCCESS',
        message: 'Plan actualizado con éxito de forma inmediata. Se cobró el prorrateo respectivo.',
      };
    }

    // ==========================================
    // CASO B: DOWNGRADE (Diferido al final de ciclo)
    // ==========================================
    if (targetHierarchy < currentHierarchy) {
      if (targetPlan === UserPlan.FREE) {
        // Cancelación al final del periodo (baja a FREE)
        await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        // Persistir inmediatamente sin esperar el webhook (crítico en desarrollo local)
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            cancelAtPeriodEnd: true,
            pendingPriceId: null, // FREE no tiene priceId
          },
        });

        return {
          action: 'DOWNGRADE_PENDING',
          message: 'Tu suscripción será cancelada al finalizar el ciclo de cobro. Mantendrás beneficios hasta entonces.',
        };
      } else {
        let scheduleId = subscription.schedule as string | null;

        if (scheduleId) {
          // Caso 1: Ya existe un schedule activo (ej. por cancelación de un plan diferido previo).
          // Recuperamos el schedule y lo actualizamos en lugar de intentar crear uno nuevo.
          const schedule = await this.stripe.subscriptionSchedules.retrieve(scheduleId);
          const currentPhase = schedule.phases[0];

          await this.stripe.subscriptionSchedules.update(scheduleId, {
            end_behavior: 'release', // Volver a 'release' para que continúe al terminar
            phases: [
              {
                start_date: currentPhase.start_date,
                end_date: currentPhase.end_date,
                items: currentPhase.items as any,
              },
              {
                start_date: currentPhase.end_date,
                items: [
                  {
                    price: targetPriceId!,
                    quantity: 1,
                  },
                ],
              },
            ],
          });
        } else {
          // Caso 2: Suscripción directa (sin schedule) que tiene cancelación programada.
          // Reactivarla primero en Stripe para permitir asociarle un Subscription Schedule.
          if (subscription.cancel_at_period_end) {
            await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
              cancel_at_period_end: false,
            });
          }

          // Crear el schedule desde la suscripción reactivada
          const schedule = await this.stripe.subscriptionSchedules.create({
            from_subscription: user.stripeSubscriptionId,
          });

          const currentPhase = schedule.phases[0];

          await this.stripe.subscriptionSchedules.update(schedule.id, {
            phases: [
              {
                start_date: currentPhase.start_date,
                end_date: currentPhase.end_date,
                items: currentPhase.items as any,
              },
              {
                start_date: currentPhase.end_date,
                items: [
                  {
                    price: targetPriceId!,
                    quantity: 1,
                  },
                ],
              },
            ],
          });
        }

        // Persistir inmediatamente sin esperar el webhook (crítico en desarrollo local)
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            cancelAtPeriodEnd: true,
            pendingPriceId: targetPriceId, // Guarda el plan destino para mostrarlo en el banner
          },
        });

        return {
          action: 'DOWNGRADE_PENDING',
          message: 'Tu plan se actualizará al plan Básico de forma automática el día de tu próxima fecha de cobro.',
        };
      }
    }
  }
}
