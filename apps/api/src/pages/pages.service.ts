import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private prisma: PrismaService) {}

  // Public listing — only published pages, unless a valid preview request asks
  // for everything (Draft Mode).
  async findAll(preview = false) {
    return this.prisma.page.findMany({
      where: preview ? undefined : { status: ContentStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin listing — every page regardless of status.
  async findAllAdmin() {
    return this.prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(idOrSlug: string, preview = false) {
    const page = await this.prisma.page.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(preview ? {} : { status: ContentStatus.PUBLISHED }),
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with id/slug ${idOrSlug} not found`);
    }
    return page;
  }

  // Admin single fetch (e.g. the editor) — any status.
  async findOneAdmin(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found`);
    }
    return page;
  }

  // The page designated as the site home (rendered at "/"). Respects publish
  // status unless this is a preview request. Returns null when none is set.
  async findHomepage(preview = false) {
    return this.prisma.page.findFirst({
      where: {
        isHomepage: true,
        ...(preview ? {} : { status: ContentStatus.PUBLISHED }),
      },
    });
  }

  // Make `id` the one and only homepage (clears any previous one atomically).
  async setHomepage(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException(`Page with id ${id} not found`);

    await this.prisma.$transaction([
      this.prisma.page.updateMany({
        where: { isHomepage: true, id: { not: id } },
        data: { isHomepage: false },
      }),
      this.prisma.page.update({ where: { id }, data: { isHomepage: true } }),
    ]);
    return { id, isHomepage: true };
  }

  async create(data: any) {
    return this.prisma.page.create({ data: this.normalizeStatus(data) });
  }

  async update(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data: this.normalizeStatus(data),
    });
  }

  async remove(id: string) {
    return this.prisma.page.delete({
      where: { id },
    });
  }

  // Keep status/publishAt coherent: a publishAt in the past with SCHEDULED is
  // promoted straight to PUBLISHED; clearing the schedule drops publishAt.
  private normalizeStatus(data: any) {
    if (data.publishAt) data.publishAt = new Date(data.publishAt);
    if (
      data.status === ContentStatus.SCHEDULED &&
      data.publishAt instanceof Date &&
      data.publishAt.getTime() <= Date.now()
    ) {
      data.status = ContentStatus.PUBLISHED;
    }
    if (data.status && data.status !== ContentStatus.SCHEDULED) {
      data.publishAt = null;
    }
    return data;
  }

  // Promote scheduled pages whose time has arrived. Mirrors the chat-retention
  // cron pattern (ScheduleModule is registered globally in AppModule).
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    const due = await this.prisma.page.updateMany({
      where: { status: ContentStatus.SCHEDULED, publishAt: { lte: new Date() } },
      data: { status: ContentStatus.PUBLISHED },
    });
    if (due.count > 0) {
      this.logger.log(`Auto-published ${due.count} scheduled page(s).`);
    }
  }
}
