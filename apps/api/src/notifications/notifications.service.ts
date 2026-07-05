import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@repo/database';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /** Record an admin notification. Never throws — callers fire-and-forget. */
  async create(input: {
    type: NotificationType;
    title: string;
    body?: string | null;
    link?: string | null;
  }) {
    try {
      return await this.prisma.notification.create({
        data: {
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          link: input.link ?? null,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to record notification: ${(err as Error).message}`);
      return null;
    }
  }

  findRecent(limit = 30) {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }

  async unreadCount(): Promise<number> {
    return this.prisma.notification.count({ where: { read: false } });
  }

  async markRead(id: string) {
    await this.prisma.notification.updateMany({ where: { id }, data: { read: true } });
    return { ok: true };
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    return { ok: true };
  }
}
