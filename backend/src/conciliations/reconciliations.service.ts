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
  constructor(private readonly prisma: PrismaService) {}

  async createBulk(createConciliationDto: CreateConciliationDto, userEmail?: string) {
    try {
      // Aseguramos que el usuario exista en la base de datos local para evitar violaciones de clave foránea (P2003)
      await this.prisma.user.upsert({
        where: { id: createConciliationDto.userId },
        update: {},
        create: {
          id: createConciliationDto.userId,
          email: userEmail || 'user@example.com',
        },
      });

      // Al ser un esquema basado en documentos JSONB, guardamos todo en un solo query atómico
      const newConciliation = await this.prisma.conciliation.create({
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
          movements: (createConciliationDto.movements ??
            []) as Prisma.InputJsonValue,
          invoices: (createConciliationDto.invoices ??
            []) as Prisma.InputJsonValue,
          remainingInvoices:
            createConciliationDto.remainingInvoices as Prisma.InputJsonValue,
          remainingBankMovements:
            createConciliationDto.remainingBankMovements as Prisma.InputJsonValue,
        },
      });

      return {
        success: true,
        message:
          'La sesión de conciliación ha sido guardada en el histórico exitosamente.',
        id: newConciliation.id,
      };
    } catch (error) {
      console.error('Error al guardar conciliación JSONB:', error);
      throw new InternalServerErrorException(
        'No se pudo guardar la sesión de conciliación en la base de datos.',
      );
    }
  }

  /**
   * Actualiza una conciliación existente (flujo "Reanudar").
   * Verifica ownership antes de mutar para blindaje multi-tenant.
   */
  async updateOne(
    id: string,
    dto: CreateConciliationDto,
    userEmail?: string,
  ) {
    try {
      // Idempotente: asegurar que el usuario exista en la tabla local
      await this.prisma.user.upsert({
        where: { id: dto.userId },
        update: {},
        create: {
          id: dto.userId,
          email: userEmail || 'user@example.com',
        },
      });

      // ✅ BLINDAJE MULTI-TENANT: verificar que el registro pertenece al usuario
      // antes de ejecutar cualquier mutación sobre la base de datos.
      const existing = await this.prisma.conciliation.findFirst({
        where: { id, userId: dto.userId },
        select: { id: true },
      });

      if (!existing) {
        throw new ForbiddenException(
          'No se encontró la conciliación o no tienes permiso para modificarla.',
        );
      }

      // UPDATE QUIRÚRGICO: reemplazamos el snapshot completo con el estado actual
      const updated = await this.prisma.conciliation.update({
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
          remainingBankMovements:
            dto.remainingBankMovements as Prisma.InputJsonValue,
        },
      });

      return {
        success: true,
        message: 'La conciliación ha sido actualizada exitosamente.',
        id: updated.id,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      console.error('Error al actualizar conciliación:', error);
      throw new InternalServerErrorException(
        'No se pudo actualizar la sesión de conciliación en la base de datos.',
      );
    }
  }

  /**
   * Obtiene el listado optimizado (Lightweight) de conciliaciones por usuario.
   * Excluye los payloads JSONB masivos.
   */
  async findAllByUser(userId: string) {
    try {
      return await this.prisma.conciliation.findMany({
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
          createdAt: 'desc', // Las más recientes primero
        },
      });
    } catch (error) {
      console.error('Error al obtener histórico:', error);
      throw new InternalServerErrorException(
        'Error al recuperar el historial de conciliaciones.',
      );
    }
  }

  /**
   * Obtiene la sesión de conciliación completa incluyendo los snapshots JSONB
   */
  async findOne(id: string, userId: string) {
    try {
      const conciliation = await this.prisma.conciliation.findFirst({
        where: { id, userId },
      });

      if (!conciliation) {
        throw new NotFoundException(
          `No se encontró la conciliación con ID: ${id} para este usuario.`,
        );
      }

      return conciliation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Error al obtener detalle de conciliación:', error);
      throw new InternalServerErrorException(
        'Error al recuperar el detalle de la conciliación.',
      );
    }
  }
}
