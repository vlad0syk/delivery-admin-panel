import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreateOrderDto {
  id?: string;

  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @Type(() => String)
  @IsString()
  timestamp!: string;

  @Type(() => Number)
  @IsNumber()
  subtotal!: number;
}
