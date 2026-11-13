import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  @Get('categories') // keep above ':id'
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.productsService.getReviews(Number(id));
  }

  @Post(':id/reviews')
  addReview(@Param('id') id: string, @Body() body: any) {
    return this.productsService.addReview(Number(id), body);
  }
}