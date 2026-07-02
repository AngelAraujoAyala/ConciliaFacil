import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
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
}