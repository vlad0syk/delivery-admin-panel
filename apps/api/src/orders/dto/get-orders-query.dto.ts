export class GetOrdersQueryDto {
  page?: string;
  limit?: string;
  id?: string;
  taxRateRegionId?: string;
  taxRateRegionName?: string;
  dateFrom?: string;
  dateTo?: string;
  minSubtotal?: string;
  maxSubtotal?: string;
}
