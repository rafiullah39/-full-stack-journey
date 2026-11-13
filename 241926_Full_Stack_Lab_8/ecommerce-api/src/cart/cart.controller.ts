import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(Number(userId));
  }

  @Post(':userId')
  addItem(@Param('userId') userId: string, @Body() body: any) {
    return this.cartService.addItem(Number(userId), Number(body.productId), body.size);
  }

  @Patch(':userId/quantity')
  updateQty(@Param('userId') userId: string, @Body() body: any) {
    return this.cartService.updateQty(Number(userId), Number(body.productId), body.size, Number(body.qty));
  }

  @Patch(':userId/size')
  changeSize(@Param('userId') userId: string, @Body() body: any) {
    return this.cartService.changeSize(Number(userId), Number(body.productId), body.size, body.newSize);
  }

  @Delete(':userId/items/:productId/:size')
  removeItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Param('size') size: string,
  ) {
    return this.cartService.removeItem(Number(userId), Number(productId), size);
  }
}