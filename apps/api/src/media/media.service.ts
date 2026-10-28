import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@hexapixora/database';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MediaCreateInput) {
    return this.prisma.media.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  async findByFilename(filename: string) {
    return this.prisma.media.findFirst({
      where: { filename },
    });
  }

  // Public lookup used by the site renderer: filename -> alt text.
  async findAltTexts() {
    return this.prisma.media.findMany({
      where: { alt: { not: null } },
      select: { filename: true, alt: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; folder?: string; alt?: string | null },
  ) {
    return this.prisma.media.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.media.delete({
      where: { id },
    });
  }
}
