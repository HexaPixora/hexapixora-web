import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentStatus, Prisma } from '@prisma/client';
import { sanitizeSections } from '../../common/html/sanitize-html';
import { PrismaService } from '../../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

// A write payload while normalizeStatus fills in derived fields.
type PageDraft = Omit<UpdatePageDto, 'publishAt' | 'sections'> & {
  publishAt?: Date | string | null;
  // Free-form builder JSON, validated by the admin, stored as-is.
  sections?: Prisma.InputJsonValue;
};

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    private prisma: PrismaService,
    private revalidate: RevalidateService,
  ) {}

  // Public listing — only published pages.
  async findAll() {
    return this.prisma.page.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin listing — every page regardless of status.
  async findAllAdmin() {
    return this.prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(idOrSlug: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: ContentStatus.PUBLISHED,
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

  // The page designated as the site home (rendered at "/"). Only when published.
  // Returns null when none is set.
  async findHomepage() {
    return this.prisma.page.findFirst({
      where: {
        isHomepage: true,
        status: ContentStatus.PUBLISHED,
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

  async create(data: CreatePageDto) {
    const draft = this.normalizeStatus(this.cleanSections(data) as PageDraft);
    return this.prisma.page.create({
      data: { ...draft, title: data.title, slug: data.slug },
    });
  }

  async update(id: string, data: UpdatePageDto) {
    return this.prisma.page.update({
      where: { id },
      data: this.normalizeStatus(this.cleanSections(data) as PageDraft),
    });
  }

  // Rich-text sections are rendered as HTML on the site, so their HTML is
  // cleaned before it is stored.
  private cleanSections<T extends { sections?: unknown }>(data: T): T {
    return data.sections === undefined
      ? data
      : { ...data, sections: sanitizeSections(data.sections) };
  }

  async remove(id: string) {
    return this.prisma.page.delete({
      where: { id },
    });
  }

  // Keep status/publishAt coherent: a publishAt in the past with SCHEDULED is
  // promoted straight to PUBLISHED; clearing the schedule drops publishAt.
  private normalizeStatus(data: PageDraft) {
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

  // Promote scheduled pages whose time has arrived.
  // ScheduleModule is registered globally in AppModule.
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    const due = await this.prisma.page.updateMany({
      where: {
        status: ContentStatus.SCHEDULED,
        publishAt: { lte: new Date() },
      },
      data: { status: ContentStatus.PUBLISHED },
    });
    if (due.count > 0) {
      this.logger.log(`Auto-published ${due.count} scheduled page(s).`);
      this.revalidate.schedule();
    }
  }
}
