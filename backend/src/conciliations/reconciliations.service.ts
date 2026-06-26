import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';
import { ConciliationStatus } from '@prisma/client';

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
          status: createConciliationDto.status as ConciliationStatus,
          matches: createConciliationDto.matches,
          remainingInvoices: createConciliationDto.remainingInvoices,
          remainingBankMovements: createConciliationDto.remainingBankMovements,
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
          createdAt: true,
          updatedAt: true,
          // matches, remainingInvoices y remainingBankMovements quedan omitidos explícitamente
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
