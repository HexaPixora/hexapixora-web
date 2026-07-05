import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@repo/database';

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing && existing.status === 'ACTIVE') {
      throw new ConflictException('Email already subscribed');
    }
    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'ACTIVE' },
      create: { email },
    });

    void this.notifications.create({
      type: NotificationType.NEWSLETTER,
      title: 'New newsletter subscriber',
      body: email,
      link: '/admin/newsletter',
    });

    return subscriber;
  }

  async findAll(params: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async unsubscribe(id: string) {
    return this.prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: 'UNSUBSCRIBED' },
    });
  }

  async remove(id: string) {
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }
}
