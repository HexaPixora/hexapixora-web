import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@repo/database';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  /** Record an admin notification. Never throws — callers fire-and-forget. */
  async create(input: {
    type: NotificationType;
    title: string;
    body?: string | null;
    link?: string | null;
  }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          type: input.type,
          title: input.title,
          body: input.body ?? null,
          link: input.link ?? null,
        },
      });
      // Fan out to any subscribed admin devices (Web Push). Fire-and-forget.
      void this.push.sendToAll({
        title: input.title,
        body: input.body,
        url: input.link,
        tag: notification.id,
      });
      return notification;
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
