import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() payload: CreateOrderDto) {
    try {
      console.log(payload);
      return this.ordersService.createOrder(payload);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async getOrders(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.getOrders(query);
  }

  @Get('stats')
  async getStats() {
    return this.ordersService.getStats();
  }

  @Delete()
  async clearOrders() {
    return this.ordersService.clearOrders();
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }

  @Patch(':id')
  async updateOrder(@Param('id') id: string, @Body() payload: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, payload);
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
