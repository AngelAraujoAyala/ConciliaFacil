import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateConciliationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsNumber()
  successRate!: number;

  @IsNumber()
  totalInvoices!: number;

  @IsNumber()
  totalBankMovements!: number;

  @IsNumber()
  matchedCount!: number;

  @IsNumber()
  @IsOptional()
  schemaVersion?: number;

  @IsArray()
  matches!: Record<string, unknown>[];

  @IsArray()
  @IsOptional()
  movements?: Record<string, unknown>[];

  @IsArray()
  @IsOptional()
  invoices?: Record<string, unknown>[];

  @IsArray()
  remainingInvoices!: Record<string, unknown>[];

  @IsArray()
  remainingBankMovements!: Record<string, unknown>[];
}
