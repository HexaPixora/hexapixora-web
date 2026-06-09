import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LayoutsService {
  constructor(private prisma: PrismaService) {}

  async findByKey(key: string) {
    return this.prisma.layoutConfig.findUnique({ where: { key } });
  }

  async upsert(key: string, data: any) {
    return this.prisma.layoutConfig.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
  }
}
