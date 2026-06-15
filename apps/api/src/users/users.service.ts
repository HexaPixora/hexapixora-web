import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@repo/database';
import * as bcrypt from 'bcryptjs';

// Fields safe to return to clients (everything except the password hash).
const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  permissions: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  // --- Admin user management (password hash is never returned) ---

  async findAllSafe() {
    return this.prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMember(input: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    permissions?: string[];
  }) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role ?? Role.TEAM_MEMBER,
        permissions: input.permissions ?? [],
      },
      select: SAFE_SELECT,
    });
  }

  async updateMember(
    id: string,
    input: {
      name?: string;
      role?: Role;
      permissions?: string[];
      password?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.role !== undefined) data.role = input.role;
    if (input.permissions !== undefined) data.permissions = input.permissions;
    if (input.password) data.password = await bcrypt.hash(input.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_SELECT,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }
}
