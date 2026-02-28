import { IsOptional, IsString } from 'class-validator';

export class GetOrdersQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  taxRateRegionId?: string;

  @IsOptional()
  @IsString()
  taxRateRegionName?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  minSubtotal?: string;

  @IsOptional()
  @IsString()
  maxSubtotal?: string;

  @IsOptional()
  @IsString()
  minTaxAmount?: string;

  @IsOptional()
  @IsString()
  maxTaxAmount?: string;

  @IsOptional()
  @IsString()
  specialRate?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}