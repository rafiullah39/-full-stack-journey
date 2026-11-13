import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Product {
  id: number;
  img: string;
  name: string;
  cat: string;
  tag: string;
  price: number;
  rating: number;
  rev: number;
  desc: string;
  reviews: Review[];
}

@Injectable()
export class ProductsService {
  // in-memory data (same products as the HTML page)
  private products: Product[] = [
    { id: 1, img: 'p1', name: 'The Swat Valley Heirloomed Shalwar Kameez', cat: 'Shalwar Kameez', tag: 'Bespoke Heritage', price: 38500, rating: 5.0, rev: 102, desc: 'Cream boski silk with tonal banarsi kameez detail.', reviews: [] },
    { id: 2, img: 'p2', name: 'Old-School Retro Camp Collar Shirt', cat: 'Vintage Shirts', tag: 'Vintage Classic', price: 18000, rating: 4.8, rev: 89, desc: '1970s block-printed slub cotton in indigo & terracotta.', reviews: [] },
    { id: 3, img: 'p3', name: 'Nawab Zari Embellished Raw Silk Waistcoat', cat: 'Waistcoats', tag: 'Hand-Embroidered', price: 32500, rating: 5.0, rev: 206, desc: 'Midnight royal cobalt with antique gold dabka work.', reviews: [] },
    { id: 4, img: 'p4', name: 'Peshawari Kurta with Hand-Pleated Shalwar', cat: 'Shalwar Kameez', tag: 'Limited Batch', price: 25000, rating: 4.9, rev: 76, desc: 'Sage olive khaddar with authentic wide-cut chest canvas.', reviews: [] },
    { id: 5, img: 'p5', name: 'Artisanal Cuban Linen Vintage Shirt', cat: 'Vintage Shirts', tag: 'Pure Linen', price: 19800, rating: 4.9, rev: 115, desc: 'Saffron ochre pure linen with mother-of-pearl buttons.', reviews: [] },
    { id: 6, img: 'p6', name: 'Imperial Jamawar Occasion Kameez Set', cat: 'Royal Kurtas', tag: 'Bridal / Occasion', price: 48000, rating: 5.0, rev: 170, desc: 'Deep maroon & gold jacquard with pleated chudidar.', reviews: [] },
  ];

  // all products, or only one category (?category=Waistcoats)
  findAll(category?: string) {
    if (!category || category === 'All') return this.products;
    return this.products.filter((p) => p.cat === category);
  }

  getCategories() {
    return ['All', ...new Set(this.products.map((p) => p.cat))];
  }

  findOne(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  getReviews(id: number) {
    return this.findOne(id).reviews;
  }

  addReview(id: number, body: any) {
    const product = this.findOne(id);
    const user = (body.user || '').trim();
    const comment = (body.comment || '').trim();
    const rating = Number(body.rating);

    if (!user || !comment) throw new BadRequestException('Name and comment are required.');
    if (!(rating >= 1 && rating <= 5)) throw new BadRequestException('Rating must be between 1 and 5.');

    product.reviews.push({ user, rating, comment });
    // update the average rating and review count
    product.rating = Math.round(((product.rating * product.rev + rating) / (product.rev + 1)) * 10) / 10;
    product.rev += 1;
    return product;
  }
}