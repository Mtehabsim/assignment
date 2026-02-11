import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { Language } from '../enums/program.enums';

/**
 * Core DTOs - Foundation types
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
  @IsObject()
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
  @IsObject()
  source_metadata?: Record<string, any>;
}