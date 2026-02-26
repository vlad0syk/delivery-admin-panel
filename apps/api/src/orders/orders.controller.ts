import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() payload: CreateOrderDto) {
    return this.ordersService.createOrder(payload);
  }

  @Get()
  async getOrders(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.getOrders(query);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importOrders(@UploadedFile() file?: { buffer: Buffer }) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('CSV file is required in the "file" field');
    }

    return this.ordersService.importOrders(file.buffer.toString('utf8'));
  }
}
