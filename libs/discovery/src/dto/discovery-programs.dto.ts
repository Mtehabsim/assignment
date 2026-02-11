import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Language, SortOption } from '@app/core';

export class SearchProgramsDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsEnum(Language)
  lang?: Language;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class ListProgramsDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @IsOptional()
  @IsEnum(Language)
  lang?: Language;
}

export class RelatedProgramsDto {
  @IsOptional()
  @IsNumber()
  limit?: number;
}
