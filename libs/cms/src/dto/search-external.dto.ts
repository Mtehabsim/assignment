import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';
import { Provider } from '@app/core';

export class SearchExternalDto {
  @IsEnum(Provider)
  provider!: Provider;

  @IsString()
  q!: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
