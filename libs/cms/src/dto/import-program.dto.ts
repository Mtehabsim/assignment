import { IsEnum, IsString } from 'class-validator';
import { Provider } from '@app/core';

export class ImportProgramDto {
  @IsEnum(Provider)
  provider!: Provider;

  @IsString()
  externalId!: string;
}
