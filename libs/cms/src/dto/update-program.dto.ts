import { IsString, IsOptional, IsEnum } from "class-validator";
import { UpdateProgramDto as CoreUpdateDto } from "@app/core";
import { ProgramCategory } from "@app/core";

export class CmsUpdateProgramDto extends CoreUpdateDto {
  
  @IsOptional()
  @IsEnum(ProgramCategory)
  category?: ProgramCategory;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;
}