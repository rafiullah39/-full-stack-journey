import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private nextId = 1;

  signup(body: any) {
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const { password, confirmPassword } = body;

    if (!name || !email || !password) throw new BadRequestException('Please fill in all fields.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new BadRequestException('Enter a valid email address.');
    if (password.length < 6) throw new BadRequestException('Password must be at least 6 characters.');
    if (confirmPassword !== undefined && password !== confirmPassword)
      throw new BadRequestException('Passwords do not match.');
    if (this.users.some((u) => u.email === email))
      throw new ConflictException('This email is already registered. Try signing in.');

    const user: User = { id: this.nextId++, name, email, password };
    this.users.push(user);
    return this.withoutPassword(user);
  }

  login(body: any) {
    const email = (body.email || '').trim().toLowerCase();
    const user = this.users.find((u) => u.email === email && u.password === body.password);
    if (!user) throw new UnauthorizedException('Invalid email or password.');
    return this.withoutPassword(user);
  }

  findById(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found. Sign up first.`);
    return this.withoutPassword(user);
  }

  private withoutPassword(user: User) {
    const { password, ...safe } = user;
    return safe;
  }
}