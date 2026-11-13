import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':userId')
  placeOrder(@Param('userId') userId: string, @Body() body: any) {
    return this.ordersService.placeOrder(Number(userId), body);
  }

  @Get('user/:userId') // keep above ':orderId'
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(Number(userId));
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.ordersService.findOne(orderId);
  }
}