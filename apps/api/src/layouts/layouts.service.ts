import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LayoutsService {
  constructor(private prisma: PrismaService) {}

  async findByKey(key: string) {
    const found = await this.prisma.layoutConfig.findUnique({ where: { key } });
    // Never return bare null — NestJS serializes that as an empty body, which
    // makes the frontend's res.json() throw. Always return valid JSON.
    return found ?? { key, data: null };
  }

  async upsert(key: string, data: any) {
    return this.prisma.layoutConfig.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
  }
}
