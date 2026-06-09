import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.portfolio.create({ data });
  }

  async findAll() {
    return this.prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.portfolio.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.portfolio.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException('Portfolio item not found');
    return item;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.portfolio.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.portfolio.delete({ where: { id } });
  }
}
