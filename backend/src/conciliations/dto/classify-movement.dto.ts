import { IsBoolean, IsEnum, IsOptional, IsString, IsArray } from 'class-validator';

export class ClassifyMovementDto {
  @IsBoolean()
  isException!: boolean;

  @IsEnum(['TRASPASO', 'RETIRO_EFECTIVO', 'COMISION_GLOBAL', 'MANUAL_MATCH'])
  @IsOptional()
  exceptionType?: 'TRASPASO' | 'RETIRO_EFECTIVO' | 'COMISION_GLOBAL' | 'MANUAL_MATCH' | null;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  matchedManualWith?: string[];
}
