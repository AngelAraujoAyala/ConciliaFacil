import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateConciliationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string; // ID del contador o usuario dueño de la info

  @IsString()
  @IsNotEmpty()
  status!: string; // Estado de la conciliación: 'DRAFT' o 'COMPLETED'

  @IsNumber()
  successRate!: number;

  @IsNumber()
  totalInvoices!: number;

  @IsNumber()
  totalBankMovements!: number;

  @IsNumber()
  matchedCount!: number;

  @IsArray()
  @IsNotEmpty()
  matches!: any[]; // El array ConciliationMatch[] proveniente de Zustand

  @IsArray()
  remainingInvoices!: any[]; // Facturas sin movimiento

  @IsArray()
  remainingBankMovements!: any[]; // Movimientos de banco sin factura
}
