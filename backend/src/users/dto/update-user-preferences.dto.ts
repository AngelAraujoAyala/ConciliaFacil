import {
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum AppThemeDto {
  light = 'light',
  dark = 'dark',
}

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsEnum(AppThemeDto)
  theme?: AppThemeDto;
}
