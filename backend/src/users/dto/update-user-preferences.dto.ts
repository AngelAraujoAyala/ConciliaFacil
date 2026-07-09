import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum AppThemeDto {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsEnum(AppThemeDto)
  theme?: AppThemeDto;

  @IsOptional()
  @IsString()
  @MinLength(1)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsString()
  defaultRfc?: string | null;
}
