export class CreateOrderDto {
  id?: string;
  longitude!: number | string;
  latitude!: number | string;
  timestamp!: string;
  subtotal!: number | string;
}
