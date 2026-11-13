import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';

export interface Order {
  id: string;
  userId: number;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  cardLast4?: string;
  delivery: { name: string; phone: string; email: string; city: string; zip: string; address: string; note: string };
  status: string;
  createdAt: string;
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(private readonly cartService: CartService) {}

  // CHECKOUT: validate -> create order from the cart -> empty the cart
  placeOrder(userId: number, body: any) {
    const cart = this.cartService.getCart(userId);
    if (!cart.items.length) throw new BadRequestException('Your cart is empty.');

    const t = (v: any) => (v || '').toString().trim();
    const delivery = {
      name: t(body.name),
      phone: t(body.phone),
      email: t(body.email).toLowerCase(),
      city: t(body.city),
      zip: t(body.zip),
      address: t(body.address),
      note: t(body.note),
    };

    if (!delivery.name || !delivery.phone || !delivery.email || !delivery.city || !delivery.address)
      throw new BadRequestException('Please fill in name, phone, email, city and address.');
    if (!/^[0-9+\-\s]{10,15}$/.test(delivery.phone)) throw new BadRequestException('Enter a valid phone number.');
    if (!/^\S+@\S+\.\S+$/.test(delivery.email)) throw new BadRequestException('Enter a valid email address.');

    const paymentMethod = t(body.paymentMethod) || 'Cash on Delivery';
    let cardLast4: string | undefined;

    if (paymentMethod === 'Card') {
      const card = body.card || {};
      const num = t(card.number).replace(/\s/g, '');
      if (num.length !== 16) throw new BadRequestException('Card number must be 16 digits.');
      if (!t(card.name)) throw new BadRequestException('Enter the name on the card.');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(t(card.expiry))) throw new BadRequestException('Expiry must be in MM/YY format.');
      if (!/^\d{3,4}$/.test(t(card.cvv))) throw new BadRequestException('Enter a valid CVV.');
      cardLast4 = num.slice(-4); // never store the full card
    }

    const order: Order = {
      id: 'RC-' + Math.floor(100000 + Math.random() * 900000),
      userId,
      items: cart.items,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
      paymentMethod,
      cardLast4,
      delivery,
      status: 'Placed',
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);
    this.cartService.clear(userId);
    return order;
  }

  findByUser(userId: number) {
    return this.orders.filter((o) => o.userId === userId);
  }

  findOne(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }
}