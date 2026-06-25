// src/conciliations/reconciliations.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciliationDto } from './dto/create-conciliation.dto';

@Injectable()
export class ReconciliationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBulk(createConciliationDto: CreateConciliationDto) {
    try {
      // Al ser un esquema basado en documentos JSONB, guardamos todo en un solo query atómico
      const newConciliation = await this.prisma.conciliation.create({
        data: {
          title: createConciliationDto.title,
          userId: createConciliationDto.userId,
          successRate: createConciliationDto.successRate,
          totalInvoices: createConciliationDto.totalInvoices,
          totalBankMovements: createConciliationDto.totalBankMovements,
          matchedCount: createConciliationDto.matchedCount,
          status: 'COMPLETED', // Usamos el Enum de tu schema
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
}
