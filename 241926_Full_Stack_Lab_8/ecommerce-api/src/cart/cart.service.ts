import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';

export interface CartItem {
  productId: number;
  size: string;
  qty: number;
}

const SIZES = ['S', 'M', 'L', 'XL'];

@Injectable()
export class CartService {
  private carts = new Map<number, CartItem[]>(); // userId -> items

  constructor(
    private readonly authService: AuthService,
    private readonly productsService: ProductsService,
  ) {}

  private getItems(userId: number): CartItem[] {
    this.authService.findById(userId); // throws if the user doesn't exist
    if (!this.carts.has(userId)) this.carts.set(userId, []);
    return this.carts.get(userId)!;
  }

  private checkSize(size: string) {
    if (!SIZES.includes(size)) throw new BadRequestException('Size must be S, M, L or XL.');
  }

  private findIndex(items: CartItem[], productId: number, size: string) {
    const i = items.findIndex((c) => c.productId === productId && c.size === size);
    if (i === -1) throw new NotFoundException('Item not in cart.');
    return i;
  }

  // DISPLAY CART (with totals, same rules as the HTML: free shipping from Rs. 50,000)
  getCart(userId: number) {
    const items = this.getItems(userId).map((c) => {
      const p = this.productsService.findOne(c.productId);
      return {
        productId: p.id,
        name: p.name,
        img: p.img,
        price: p.price,
        size: c.size,
        qty: c.qty,
        lineTotal: p.price * c.qty,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const shipping = subtotal === 0 ? 0 : subtotal >= 50000 ? 0 : 500;
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }

  // ADD TO CART
  addItem(userId: number, productId: number, size = 'M') {
    this.checkSize(size);
    this.productsService.findOne(productId); // throws if product doesn't exist
    const items = this.getItems(userId);
    const existing = items.find((c) => c.productId === productId && c.size === size);
    if (existing) existing.qty++;
    else items.push({ productId, size, qty: 1 });
    return this.getCart(userId);
  }

  // EDIT: change quantity (qty below 1 removes the item)
  updateQty(userId: number, productId: number, size: string, qty: number) {
    const items = this.getItems(userId);
    const i = this.findIndex(items, productId, size);
    if (!Number.isInteger(qty)) throw new BadRequestException('qty must be a whole number.');
    if (qty < 1) items.splice(i, 1);
    else items[i].qty = qty;
    return this.getCart(userId);
  }

  // EDIT: change size (merges with the same product+size if it exists)
  changeSize(userId: number, productId: number, size: string, newSize: string) {
    this.checkSize(newSize);
    const items = this.getItems(userId);
    const i = this.findIndex(items, productId, size);
    const other = items.findIndex((c, j) => j !== i && c.productId === productId && c.size === newSize);
    if (other > -1) {
      items[other].qty += items[i].qty;
      items.splice(i, 1);
    } else {
      items[i].size = newSize;
    }
    return this.getCart(userId);
  }

  // REMOVE one item
  removeItem(userId: number, productId: number, size: string) {
    const items = this.getItems(userId);
    items.splice(this.findIndex(items, productId, size), 1);
    return this.getCart(userId);
  }

  // empty the cart (used after checkout)
  clear(userId: number) {
    this.getItems(userId).length = 0;
  }
}