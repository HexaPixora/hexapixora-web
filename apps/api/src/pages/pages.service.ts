import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with id/slug ${idOrSlug} not found`);
    }
    return page;
  }

  async create(data: any) {
    return this.prisma.page.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.page.delete({
      where: { id },
    });
  }
}
