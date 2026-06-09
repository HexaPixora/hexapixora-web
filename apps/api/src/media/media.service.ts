import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@repo/database';

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

  async delete(id: string) {
    return this.prisma.media.delete({
      where: { id },
    });
  }
}
