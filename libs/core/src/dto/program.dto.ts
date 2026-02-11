import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Language } from '../enums/program.enums';

/**
 * Core DTOs - Only foundation types
 * Business-specific DTOs are in their respective libraries:
 * - CMS DTOs: libs/cms/src/dto/
 * - Discovery DTOs: libs/discovery/src/dto/
 */

export class CreateProgramDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  source_metadata?: Record<string, any>;
}

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  source_metadata?: Record<string, any>;
}
