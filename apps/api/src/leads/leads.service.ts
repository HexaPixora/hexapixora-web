import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../config/env';
import { MailService } from '../mail/mail.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(data: any) {
    const { website, ...lead } = data ?? {};

    // Honeypot tripped — a bot filled the hidden field. Acknowledge the request
    // so the bot can't distinguish success from rejection, but persist nothing.
    if (website && String(website).trim().length > 0) {
      return { id: 'ignored', ...lead };
    }

    const created = await this.prisma.lead.create({ data: lead });

    // Notify the team and acknowledge the prospect. Email must never block or
    // fail lead capture, so this runs after the record is safely persisted and
    // all errors are swallowed inside MailService / the catch below.
    this.dispatchLeadEmails(created).catch((err) =>
      this.logger.error(`Lead email dispatch failed: ${(err as Error).message}`),
    );

    return created;
  }

  /** Fire the internal notification + prospect auto-responder for a new lead. */
  private async dispatchLeadEmails(lead: {
    name: string;
    email: string;
    phone?: string | null;
    message?: string | null;
    type?: string | null;
  }): Promise<void> {
    if (!this.mail.isConfigured()) return;

    const settings = await this.prisma.siteSetting
      .findUnique({ where: { id: 'global' } })
      .catch(() => null);

    const siteName = settings?.siteName || 'HexaPixora';
    const notifyTo = env.mail.notifyTo || settings?.businessEmail || '';

    await Promise.all([
      this.mail.sendLeadNotification({ lead, notifyTo, siteName }),
      this.mail.sendLeadAutoResponse({ lead, siteName }),
    ]);
  }

  async findAll(params: { page?: number; limit?: number; status?: string } = {}) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.lead.update({ where: { id }, data: { status: status as any } });
  }

  async remove(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }
}
