import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
import { ClassifyMovementDto } from './dto/classify-movement.dto';
import { ConciliationStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReconciliationsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Helper para inyectar el contexto de usuario en la transacción de Postgres.
   * Esto simula el comportamiento de Supabase Auth para que funcione el RLS con auth.uid().
   */
  private async setAuthContext(tx: Prisma.TransactionClient, userId: string): Promise<void> {
    await tx.$executeRawUnsafe(`
      SELECT set_config('request.jwt.claims', json_build_object('sub', '${userId}')::text, true);
    `);
  }

  async createBulk(createConciliationDto: CreateConciliationDto, userEmail?: string) {
    try {
      // Usamos una transacción para encapsular la configuración de RLS y las operaciones
      return await this.prisma.$transaction(async (tx) => {
        // 1. Establecer el contexto RLS antes de cualquier consulta
        await this.setAuthContext(tx, createConciliationDto.userId);

        // 2. Aseguramos que el usuario exista en la tabla local
        await tx.user.upsert({
          where: { id: createConciliationDto.userId },
          update: {},
          create: {
            id: createConciliationDto.userId,
            email: userEmail || 'user@example.com',
          },
        });

        // 3. Crear la conciliación (validada por RLS mediante WITH CHECK)
        const newConciliation = await tx.conciliation.create({
          data: {
            title: createConciliationDto.title,
            userId: createConciliationDto.userId,
            successRate: createConciliationDto.successRate,
            totalInvoices: createConciliationDto.totalInvoices,
            totalBankMovements: createConciliationDto.totalBankMovements,
            matchedCount: createConciliationDto.matchedCount,
            schemaVersion: createConciliationDto.schemaVersion ?? 2,
            status: createConciliationDto.status as ConciliationStatus,
            matches: createConciliationDto.matches as Prisma.InputJsonValue,
            movements: (createConciliationDto.movements ?? []) as Prisma.InputJsonValue,
            invoices: (createConciliationDto.invoices ?? []) as Prisma.InputJsonValue,
            remainingInvoices: createConciliationDto.remainingInvoices as Prisma.InputJsonValue,
            remainingBankMovements: createConciliationDto.remainingBankMovements as Prisma.InputJsonValue,
          },
        });

        return {
          success: true,
          message: 'La sesión de conciliación ha sido guardada en el histórico exitosamente.',
          id: newConciliation.id,
        };
      });
    } catch (error) {
      console.error('Error al guardar conciliación JSONB con RLS:', error);
      throw new InternalServerErrorException(
        'No se pudo guardar la sesión de conciliación en la base de datos.',
      );
    }
  }

  async updateOne(id: string, dto: CreateConciliationDto, userEmail?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Establecer el contexto RLS
        await this.setAuthContext(tx, dto.userId);

        // 2. Asegurar que el usuario exista
        await tx.user.upsert({
          where: { id: dto.userId },
          update: {},
          create: {
            id: dto.userId,
            email: userEmail || 'user@example.com',
          },
        });

        // 3. El RLS ya filtra/bloquea aquí si intentas leer una conciliación ajena
        const existing = await tx.conciliation.findFirst({
          where: { id },
          select: { id: true },
        });

        if (!existing) {
          throw new ForbiddenException(
            'No se encontró la conciliación o no tienes permiso para modificarla.',
          );
        }

        // 4. Update Quirúrgico protegido por RLS (USING + WITH CHECK)
        const updated = await tx.conciliation.update({
          where: { id },
          data: {
            title: dto.title,
            successRate: dto.successRate,
            totalInvoices: dto.totalInvoices,
            totalBankMovements: dto.totalBankMovements,
            matchedCount: dto.matchedCount,
            schemaVersion: dto.schemaVersion ?? 2,
            status: dto.status as ConciliationStatus,
            matches: dto.matches as Prisma.InputJsonValue,
            movements: (dto.movements ?? []) as Prisma.InputJsonValue,
            invoices: (dto.invoices ?? []) as Prisma.InputJsonValue,
            remainingInvoices: dto.remainingInvoices as Prisma.InputJsonValue,
            remainingBankMovements: dto.remainingBankMovements as Prisma.InputJsonValue,
          },
        });

        return {
          success: true,
          message: 'La conciliación ha sido actualizada exitosamente.',
          id: updated.id,
        };
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      console.error('Error al actualizar conciliación con RLS:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la sesión de conciliación en la base de datos.',
      );
    }
  }

  async findAllByUser(userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Establecer el contexto RLS
        await this.setAuthContext(tx, userId);

        // El RLS aplica automáticamente el filtro, pero mantener 'where: { userId }' optimiza el índice.
        return await tx.conciliation.findMany({
          where: { userId },
          select: {
            id: true,
            title: true,
            status: true,
            totalInvoices: true,
            totalBankMovements: true,
            matchedCount: true,
            successRate: true,
            schemaVersion: true,
            createdAt: true,
            updatedAt: true,
            movements: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      });
    } catch (error) {
      console.error('Error al obtener histórico con RLS:', error);
      throw new InternalServerErrorException(
        'Error al recuperar el historial de conciliaciones.',
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Establecer el contexto RLS
        await this.setAuthContext(tx, userId);

        const conciliation = await tx.conciliation.findFirst({
          where: { id, userId },
        });

        if (!conciliation) {
          throw new NotFoundException(
            `No se encontró la conciliación con ID: ${id} para este usuario.`,
          );
        }

        return conciliation;
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error al obtener detalle de conciliación con RLS:', error);
      throw new InternalServerErrorException(
        'Error al recuperar el detalle de la conciliación.',
      );
    }
  }

  async classifyMovementManual(
    conciliationId: string,
    movementId: string,
    dto: ClassifyMovementDto,
    userId: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Establecer el contexto RLS
        await this.setAuthContext(tx, userId);

        // 2. Obtener la conciliación existente
        const conciliation = await tx.conciliation.findFirst({
          where: { id: conciliationId, userId },
        });

        if (!conciliation) {
          throw new NotFoundException(
            `No se encontró la conciliación con ID: ${conciliationId} para este usuario.`,
          );
        }

        // 3. Parsear JSONs
        const movements = (conciliation.movements as any[]) || [];
        const matches = (conciliation.matches as any[]) || [];
        const invoices = (conciliation.invoices as any[]) || [];
        const remainingInvoices = (conciliation.remainingInvoices as any[]) || [];
        const remainingBankMovements = (conciliation.remainingBankMovements as any[]) || [];

        // 4. Buscar el movimiento bancario
        const movementIndex = movements.findIndex((m) => m.id === movementId);
        if (movementIndex === -1) {
          throw new NotFoundException(
            `No se encontró el movimiento bancario con ID: ${movementId} en esta conciliación.`,
          );
        }

        const movement = { ...movements[movementIndex] };

        // 5. Aplicar la clasificación
        movement.isException = dto.isException;
        movement.exceptionType = dto.exceptionType || null;
        movement.notes = dto.notes || '';
        movement.matchedManualWith = dto.matchedManualWith || [];

        // Si es MANUAL_MATCH y tiene facturas asociadas, creamos el grupo si no existiera
        if (dto.exceptionType === 'MANUAL_MATCH' && dto.matchedManualWith && dto.matchedManualWith.length > 0) {
          // Remover de remainingBankMovements
          const remMovIndex = remainingBankMovements.findIndex((m) => m.id === movementId);
          if (remMovIndex !== -1) {
            remainingBankMovements.splice(remMovIndex, 1);
          }

          // Generar un nuevo grupo
          const bankTotal = movement.retiro || movement.deposito || 0;
          let invoiceTotal = 0;

          dto.matchedManualWith.forEach((invId) => {
            // Actualizar estatus de las facturas en invoices y remover de remainingInvoices
            const invIndex = invoices.findIndex((i) => i.id === invId);
            if (invIndex !== -1) {
              invoices[invIndex].status = 'MATCHED';
              invoices[invIndex].matchedMovementIds = Array.from(
                new Set([...(invoices[invIndex].matchedMovementIds || []), movementId])
              );
            }
            const remInvIndex = remainingInvoices.findIndex((i) => i.id === invId);
            if (remInvIndex !== -1) {
              invoiceTotal += remainingInvoices[remInvIndex].total || 0;
              remainingInvoices.splice(remInvIndex, 1);
            }
          });

          // Buscar si ya existe un grupo manual para este movimiento y actualizarlo, o crear uno nuevo
          const existingGroupIndex = matches.findIndex(
            (g) => g.bankMovementIds.includes(movementId) && g.source === 'MANUAL'
          );

          const newGroup = {
            id: existingGroupIndex !== -1 ? matches[existingGroupIndex].id : `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            bankMovementIds: [movementId],
            invoiceIds: dto.matchedManualWith,
            status: 'MANUAL_MATCH',
            source: 'MANUAL',
            observations: dto.notes,
            bankTotal,
            invoiceTotal,
            amountDelta: bankTotal - invoiceTotal,
            createdAt: new Date().toISOString(),
          };

          if (existingGroupIndex !== -1) {
            matches[existingGroupIndex] = newGroup;
          } else {
            matches.push(newGroup);
          }

          movement.matchedGroupId = newGroup.id;
          movement.status = 'MATCHED';
          movement.matchedInvoiceIds = dto.matchedManualWith;
        } else {
          // Si no es MANUAL_MATCH (ej: TRASPASO, RETIRO_EFECTIVO, etc)
          // Si tenía un grupo manual previo, lo removemos
          const existingGroupIndex = matches.findIndex(
            (g) => g.bankMovementIds.includes(movementId) && g.source === 'MANUAL'
          );
          if (existingGroupIndex !== -1) {
            const removedGroup = matches.splice(existingGroupIndex, 1)[0];
            // Restaurar facturas asociadas a ese grupo a remainingInvoices
            removedGroup.invoiceIds.forEach((invId) => {
              const invIndex = invoices.findIndex((i) => i.id === invId);
              if (invIndex !== -1) {
                invoices[invIndex].status = 'UNMATCHED';
                invoices[invIndex].matchedMovementIds = (invoices[invIndex].matchedMovementIds || []).filter(
                  (id: string) => id !== movementId
                );
                // Si no está ya en remainingInvoices, agregarla
                if (!remainingInvoices.some((i) => i.id === invId)) {
                  remainingInvoices.push(invoices[invIndex]);
                }
              }
            });
          }

          // Si es excepción, quitamos del matchedGroupId / matchedInvoiceIds
          movement.matchedGroupId = undefined;
          movement.matchedInvoiceIds = [];
          movement.status = dto.isException ? 'MATCHED' : 'UNMATCHED'; // Excepciones se consideran "resueltas"

          if (dto.isException) {
            // Remover de remainingBankMovements ya que está exceptuado (resuelto)
            const remMovIndex = remainingBankMovements.findIndex((m) => m.id === movementId);
            if (remMovIndex !== -1) {
              remainingBankMovements.splice(remMovIndex, 1);
            }
          } else {
            // Si le quitó la excepción, vuelve a remainingBankMovements
            if (!remainingBankMovements.some((m) => m.id === movementId)) {
              remainingBankMovements.push(movement);
            }
          }
        }

        movements[movementIndex] = movement;

        // 6. Recalcular métricas
        const totalBankMovements = movements.length;

        // Movimientos resueltos (conciliados + excepciones)
        const conciliatedBankMovementIds = new Set<string>();
        matches
          .filter((g) => g.status === 'TOTAL_MATCH' || g.status === 'MANUAL_MATCH')
          .forEach((g) => g.bankMovementIds.forEach((id: string) => conciliatedBankMovementIds.add(id)));

        const resolvedCount = movements.filter(
          (m) => m.isException || conciliatedBankMovementIds.has(m.id)
        ).length;

        const successRate = totalBankMovements > 0
          ? Math.round((resolvedCount / totalBankMovements) * 100)
          : 0;

        // 7. Guardar en Base de Datos
        const updated = await tx.conciliation.update({
          where: { id: conciliationId },
          data: {
            movements: movements as any,
            matches: matches as any,
            invoices: invoices as any,
            remainingInvoices: remainingInvoices as any,
            remainingBankMovements: remainingBankMovements as any,
            matchedCount: resolvedCount,
            successRate,
          },
        });

        return updated;
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error al clasificar movimiento:', error);
      throw new InternalServerErrorException(
        'No se pudo clasificar el movimiento en la base de datos.',
      );
    }
  }
}