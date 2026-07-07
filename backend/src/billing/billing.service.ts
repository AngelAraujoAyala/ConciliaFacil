import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { BadRequestException } from '@nestjs/common';
import { UserPlan } from '@prisma/client';

/**
 * Mapa de configuracion de planes indexado por Stripe Price ID.
 * Al agregar un nuevo plan, solo se debe anadir una entrada aqui.
 *
 * NOTA: monthlyConciliations NO forma parte de este mapa porque es el
 * contador de uso actual del mes del usuario — nunca debe sobreescribirse
 * al hacer upgrade. Los limites (3 / 50 / 200) se validan en reconciliations.service.ts.
 */
const PLAN_CONFIG: Record<string, { plan: UserPlan }> = {
    'price_1TpCWFRk8JjGytDbEsAY9wVo': { plan: UserPlan.BASIC },
    'price_1TqgASRk8JjGytDb5oegIhB0': { plan: UserPlan.PRO   },
};

@Injectable()
export class BillingService {
    private stripe: Stripe;

    constructor(private prisma: PrismaService) {
        // La asercion non-null es segura: si la variable no existe el servidor no debe
        // arrancar. Considerar agregar una validacion explicita en main.ts en el futuro.
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY no esta definida en las variables de entorno.');
        }
        this.stripe = new Stripe(secretKey, {
            apiVersion: '2026-06-24.dahlia',
        });
    }

    /** URL base del frontend. Fallback a localhost para desarrollo local. */
    private get frontendUrl(): string {
        return process.env.FRONTEND_URL ?? 'http://localhost:5173';
    }

    async createCheckoutSession(userId: string, priceId: string) {
        // 1. Verificar que el usuario exista en tu base de datos
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // 2. Si el usuario no tiene un stripeCustomerId creado, se lo generamos en Stripe
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            stripeCustomerId = customer.id;

            // Actualizamos al usuario en la base de datos con su nuevo ID de cliente de Stripe
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId },
            });
        }

        // 3. Crear la sesión de Checkout para la suscripción
        const session = await this.stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'], // Puedes agregar 'customer_balance' en el futuro si quieres SPEI
            line_items: [
                {
                    price: priceId, // Aquí pasamos el price_... de ConciliaFácil BASIC
                    quantity: 1,
                },
            ],
            // URLs a las que Stripe redirigira al usuario segun el resultado
            success_url: `${this.frontendUrl}/home?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.frontendUrl}/pricing`,
            metadata: {
                userId: user.id,
            },
        });

        // Devolvemos la URL generada para que el frontend redirija al usuario
        return { url: session.url };
    }

    async handleWebhookEvent(rawBody: Buffer, signature: string) {
        let event: Stripe.Event;

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new BadRequestException('STRIPE_WEBHOOK_SECRET no esta configurado en el servidor.');
        }

        try {
            // Verificamos de forma segura que el evento realmente venga de Stripe
            event = this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                webhookSecret,
            );
            console.log(`[Webhook] ✅ Evento verificado: ${event.type}`);
        } catch (err) {
            console.error('[Webhook] ❌ Firma invalida:', (err as Error).message);
            throw new BadRequestException(`Error de validacion en Webhook: ${(err as Error).message}`);
        }

        // Manejamos los eventos que nos interesan
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // Recuperamos el userId que guardamos en los metadata en el paso anterior
                const userId = session.metadata?.userId;
                const stripeCustomerId = session.customer as string;
                const stripeSubscriptionId = session.subscription as string;

                console.log(`[Webhook] checkout.session.completed — userId: ${userId ?? 'MISSING'}`);

                if (!userId) {
                    console.warn('[Webhook] ⚠️  userId no encontrado en metadata. No se actualizara la BD.');
                    break;
                }

                // Obtenemos los detalles de la suscripcion para saber cuando termina el periodo.
                const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

                // En Stripe API v2026-06-24.dahlia, current_period_end vive en los items de la suscripcion,
                // no en la raiz del objeto Subscription.
                const periodEnd = subscription.items.data[0]?.current_period_end || (Math.floor(Date.now() / 1000) + 30 * 24 * 3600);
                const purchasedPriceId = subscription.items.data[0]?.price.id;

                // Resolvemos el plan a partir del Price ID comprado.
                // Si el priceId no esta en el mapa (compra inesperada), usamos BASIC como fallback seguro.
                // monthlyConciliations NO se toca: es el contador de uso actual del mes, no el limite del plan.
                const planConfig = PLAN_CONFIG[purchasedPriceId] ?? { plan: UserPlan.BASIC };

                console.log(`[Webhook] Precio comprado: ${purchasedPriceId} → Plan: ${planConfig.plan}`);

                // Actualizamos al usuario en la base de datos.
                // Solo se actualizan los campos de Stripe y el plan — el contador de conciliaciones
                // (monthlyConciliations) se preserva tal como estaba antes del upgrade.
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        stripeCustomerId,
                        stripeSubscriptionId,
                        stripePriceId: purchasedPriceId,
                        subscriptionStatus: subscription.status,
                        currentPeriodEnd: new Date(periodEnd * 1000),
                        plan: planConfig.plan,
                        isSubscribed: true,
                        // monthlyConciliations se omite intencionalmente:
                        // el usuario conserva su contador actual del mes.
                    },
                });

                console.log(`[Webhook] ✅ BD actualizada — usuario ${userId} → plan ${planConfig.plan} (contador de conciliaciones preservado)`);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const stripeCustomerId = invoice.customer as string;

                // Si el pago falla (ej. tarjeta vencida), marcamos su estatus para restringir accesos
                await this.prisma.user.updateMany({
                    where: { stripeCustomerId },
                    data: {
                        subscriptionStatus: 'past_due',
                        isSubscribed: false, // Bloqueamos temporalmente sus características premium
                    },
                });
                break;
            }

            // Puedes agregar más casos en el futuro, como 'customer.subscription.deleted' para cancelaciones
        }

        return { received: true };
    }
}