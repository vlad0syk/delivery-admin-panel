export class CreateOrderDto {
  id?: string;
  longitude!: number;
  latitude!: number;
  timestamp!: string;
  subtotal!: number;
}
