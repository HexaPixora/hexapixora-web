import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const count = await this.prisma.testimonial.count();
    return this.prisma.testimonial.create({ data: { ...data, order: count } });
  }

  async findAll() {
    return this.prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonial not found');
    return item;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testimonial.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.testimonial.update({ where: { id }, data: { order: index } })
    );
    return Promise.all(updates);
  }
}
