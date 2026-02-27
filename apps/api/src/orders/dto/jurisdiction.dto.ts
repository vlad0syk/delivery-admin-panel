import { Type } from 'class-transformer';
import { JurisdictionType } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class JurisdictionDto {
  @Type(() => String)
  @IsString()
  name!: string;

  @Type(() => String)
  @IsEnum(JurisdictionType)
  type!: JurisdictionType;

  @Type(() => Number)
  @IsNumber()
  rate!: number;
}
