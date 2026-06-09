import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const count = await this.prisma.faq.count({ where: { category: data.category || null } });
    return this.prisma.faq.create({ data: { ...data, order: count } });
  }

  async findAll(category?: string) {
    const where: any = {};
    if (category) where.category = category;
    return this.prisma.faq.findMany({ where, orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  }

  async findCategories() {
    const faqs = await this.prisma.faq.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });
    return faqs.map(f => f.category).filter(Boolean);
  }

  async findOne(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.faq.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faq.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.faq.update({ where: { id }, data: { order: index } })
    );
    return Promise.all(updates);
  }
}
