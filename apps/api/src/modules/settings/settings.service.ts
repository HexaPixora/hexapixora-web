import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

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

  // The DTO whitelist already strips id and timestamps.
  async upsert(updateData: UpdateSettingsDto) {
    return this.prisma.siteSetting.upsert({
      where: { id: 'global' },
      update: updateData,
      create: { id: 'global', siteName: 'HexaPixora', ...updateData },
    });
  }
}
