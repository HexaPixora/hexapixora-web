import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { NotificationType } from '@repo/database';
import { env } from '../config/env';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private jwt: JwtService,
    private mail: MailService,
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

  // --- Unsubscribe (stateless signed token — no per-subscriber column needed) ---

  private unsubscribeUrl(email: string): string {
    const token = this.jwt.sign({ email, t: 'unsub' }, { secret: env.jwtAccessSecret });
    return `${env.appUrl}/unsubscribe?token=${token}`;
  }

  async unsubscribeByToken(token: string) {
    let email: string;
    try {
      const payload: any = this.jwt.verify(token, { secret: env.jwtAccessSecret });
      if (payload?.t !== 'unsub' || !payload?.email) throw new Error('bad token');
      email = payload.email;
    } catch {
      throw new BadRequestException('This unsubscribe link is invalid.');
    }
    await this.prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { status: 'UNSUBSCRIBED' },
    });
    return { message: "You've been unsubscribed." };
  }

  private async siteName(): Promise<string> {
    const s = await this.prisma.siteSetting
      .findUnique({ where: { id: 'global' } })
      .catch(() => null);
    return s?.siteName || 'HexaPixora';
  }

  // --- Campaigns (compose + send from the admin) ---

  createCampaign(input: { subject: string; content: string }) {
    return this.prisma.campaign.create({
      data: { subject: input.subject, content: input.content },
    });
  }

  listCampaigns() {
    return this.prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async sendTest(input: { subject: string; content: string; to: string }) {
    const siteName = await this.siteName();
    const html = this.mail.renderCampaignHtml(input.content, this.unsubscribeUrl(input.to), siteName);
    const ok = await this.mail.sendBatch([{ to: input.to, subject: `[TEST] ${input.subject}`, html }]);
    if (!ok) {
      throw new BadRequestException('Could not send the test email. Is RESEND_API_KEY configured?');
    }
    return { message: `Test sent to ${input.to}.` };
  }

  async sendCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === 'SENT' || campaign.status === 'SENDING') {
      throw new BadRequestException('This campaign has already been sent.');
    }
    const subs = await this.prisma.newsletterSubscriber.findMany({
      where: { status: 'ACTIVE' },
      select: { email: true },
    });
    if (subs.length === 0) {
      throw new BadRequestException('There are no active subscribers to send to.');
    }
    const siteName = await this.siteName();
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'SENDING', recipientCount: subs.length },
    });
    // Fire-and-forget so the request returns immediately; the campaign flips to
    // SENT/FAILED once the batch completes.
    void this.dispatchCampaign(campaign, subs.map((s) => s.email), siteName);
    return { message: `Sending to ${subs.length} subscriber(s)…`, recipientCount: subs.length };
  }

  private async dispatchCampaign(
    campaign: { id: string; subject: string; content: string },
    emails: string[],
    siteName: string,
  ) {
    try {
      const items = emails.map((to) => ({
        to,
        subject: campaign.subject,
        html: this.mail.renderCampaignHtml(campaign.content, this.unsubscribeUrl(to), siteName),
      }));
      const sent = await this.mail.sendBatch(items);
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: sent > 0 ? 'SENT' : 'FAILED', sentCount: sent, sentAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Campaign ${campaign.id} dispatch failed: ${(err as Error).message}`);
      await this.prisma.campaign
        .update({ where: { id: campaign.id }, data: { status: 'FAILED' } })
        .catch(() => undefined);
    }
  }
}
