import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Single-row upsert pattern — always returns the one settings row and avoids race conditions
    return this.prisma.siteSetting.upsert({
      where: { id: 'global' },
      update: {},
      create: { id: 'global', siteName: 'HexaPixora' },
    });
  }

  async upsert(data: any) {
    const { id, createdAt, updatedAt, ...updateData } = data;
    return this.prisma.siteSetting.upsert({
      where: { id: 'global' },
      update: updateData,
      create: { id: 'global', siteName: 'HexaPixora', ...updateData },
    });
  }
}
