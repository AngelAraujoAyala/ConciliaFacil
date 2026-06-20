import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveConciliationDto } from './dto/save-conciliation.dto';

@Injectable()
export class ConciliationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 💾 Guarda o actualiza una conciliación aplicando el Paywall
   */
  async save(userId: string, dto: SaveConciliationDto) {
    // 1. Buscamos al usuario o lo registramos automáticamente si es su primera vez (UX impecable)
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: userId,
          email: 'contador_provisorio@domain.com', // Se actualizará al sincronizar auth formalmente
          isSubscribed: false,
          freeConciliationsLeft: 1,
        },
      });
    }

    // 2. 🛡️ VERIFICACIÓN DEL PAYWALL
    // Si no está suscrito y ya no le quedan conciliaciones de prueba, bloqueamos el guardado
    if (!user.isSubscribed && user.freeConciliationsLeft <= 0) {
      throw new BadRequestException(
        'Límite excedido. Has agotado tu conciliación de prueba gratuita. Por favor, adquiere una suscripción mensual para continuar.',
      );
    }

    // 3. ⚡ EJECUCIÓN EN TRANSACCIÓN (Seguridad Absoluta)
    // Usamos una transacción para asegurar que si el guardado falla, no se reste la prueba gratis, y viceversa.
    return this.prisma.$transaction(async (tx) => {
      // Guardamos el snapshot en la base de datos
      const conciliation = await tx.conciliation.create({
        data: {
          title: dto.title,
          status: dto.status,
          matches: dto.matches,
          remainingInvoices: dto.remainingInvoices,
          successRate: dto.successRate,
          userId: userId,
        },
      });

      // Si el usuario usó su prueba gratuita, le restamos el crédito
      if (!user.isSubscribed) {
        await tx.user.update({
          where: { id: userId },
          data: {
            freeConciliationsLeft: {
              decrement: 1,
            },
          },
        });
      }

      return conciliation;
    });
  }

  /**
   * 📊 Jala el historial optimizado (Excluye los JSONB pesados para no saturar la red)
   */
  async findAllByUser(userId: string) {
    return this.prisma.conciliation.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        successRate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 🔍 Recupera una conciliación específica con sus JSONBs completos para hidratar el Zustand
   */
  async findOne(id: string, userId: string) {
    const conciliation = await this.prisma.conciliation.findFirst({
      where: {
        id,
        userId, // Verificación de seguridad: el contador solo puede ver sus propias conciliaciones
      },
    });

    if (!conciliation) {
      throw new NotFoundException(
        'La conciliación solicitada no existe o no tienes permisos para verla.',
      );
    }

    return conciliation;
  }
}
