import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ProgramCategory } from "@app/core";

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @IsOptional()
  @IsEnum(ProgramCategory)
  category?: ProgramCategory;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;
}
