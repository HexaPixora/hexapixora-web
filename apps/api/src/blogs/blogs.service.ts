import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(private prisma: PrismaService) {}

  // Fields returned to list/related views (includes related categories).
  // content is included so cards/featured can derive a snippet when a post has
  // no explicit excerpt; readTime powers the "x min read" label.
  private readonly listSelect = {
    id: true, title: true, slug: true, excerpt: true, content: true, readTime: true,
    tags: true, thumbnail: true, isPublished: true, status: true,
    publishDate: true, publishAt: true, createdAt: true, updatedAt: true,
    categories: { select: { id: true, name: true, slug: true, color: true } },
  };

  async create(data: any) {
    const { categoryIds, ...rest } = data;
    this.applyReadTime(rest);
    return this.prisma.blog.create({
      data: {
        ...this.normalizeStatus(rest),
        ...(categoryIds ? { categories: { connect: categoryIds.map((id: string) => ({ id })) } } : {}),
      },
      include: { categories: true },
    });
  }

  async findAll(params: { page?: number; limit?: number; category?: string; published?: boolean } = {}) {
    const { page = 1, limit = 10, category, published } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    // `category` is a category slug, matched through the relation.
    if (category) where.categories = { some: { slug: category } };
    if (published !== undefined) where.isPublished = published;

    const [data, total] = await Promise.all([
      this.prisma.blog.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: this.listSelect,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findRecent(limit = 5) {
    return this.prisma.blog.findMany({
      where: { isPublished: true },
      take: limit,
      orderBy: { publishDate: 'desc' },
      select: this.listSelect,
    });
  }

  // Posts sharing ≥1 category with `slug`, newest first; topped up with recent
  // posts when there aren't enough category matches.
  async findRelated(slug: string, limit = 3) {
    const current = await this.prisma.blog.findUnique({
      where: { slug },
      select: { id: true, categories: { select: { id: true } } },
    });
    if (!current) return [];

    const catIds = current.categories.map((c) => c.id);
    let related: any[] = [];
    if (catIds.length) {
      related = await this.prisma.blog.findMany({
        where: {
          isPublished: true,
          id: { not: current.id },
          categories: { some: { id: { in: catIds } } },
        },
        take: limit,
        orderBy: { publishDate: 'desc' },
        select: this.listSelect,
      });
    }
    if (related.length < limit) {
      const excludeIds = [current.id, ...related.map((r) => r.id)];
      const filler = await this.prisma.blog.findMany({
        where: { isPublished: true, id: { notIn: excludeIds } },
        take: limit - related.length,
        orderBy: { publishDate: 'desc' },
        select: this.listSelect,
      });
      related = [...related, ...filler];
    }
    return related;
  }

  // Managed taxonomy (replaces the old distinct-free-text query).
  async findCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id }, include: { categories: true } });
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  // Public render path — only published posts.
  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug }, include: { categories: true } });
    if (!blog || !blog.isPublished) {
      throw new NotFoundException('Blog post not found');
    }
    return blog;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { categoryIds, ...rest } = data;
    this.applyReadTime(rest);
    return this.prisma.blog.update({
      where: { id },
      data: {
        ...this.normalizeStatus(rest),
        ...(categoryIds !== undefined ? { categories: { set: categoryIds.map((id: string) => ({ id })) } } : {}),
      },
      include: { categories: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.blog.delete({ where: { id } });
  }

  private applyReadTime(data: any) {
    if (data.content) {
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      data.readTime = Math.ceil(wordCount / 200);
    }
  }

  // isPublished stays the canonical public filter; status is the richer label.
  // Keep them coherent however the client phrases the request (new clients send
  // `status`, legacy ones send only `isPublished`).
  private normalizeStatus(data: any) {
    if (data.publishAt) data.publishAt = new Date(data.publishAt);

    if (data.status !== undefined) {
      // A schedule whose time already passed publishes immediately.
      if (
        data.status === ContentStatus.SCHEDULED &&
        data.publishAt instanceof Date &&
        data.publishAt.getTime() <= Date.now()
      ) {
        data.status = ContentStatus.PUBLISHED;
      }
      data.isPublished = data.status === ContentStatus.PUBLISHED;
      if (data.status !== ContentStatus.SCHEDULED) data.publishAt = null;
    } else if (data.isPublished !== undefined) {
      // Legacy path: derive status from the boolean.
      data.status = data.isPublished ? ContentStatus.PUBLISHED : ContentStatus.DRAFT;
    }

    // Stamp a display/sort date the first time a post goes live.
    if (data.isPublished && !data.publishDate) data.publishDate = new Date();
    return data;
  }

  // Promote scheduled posts whose time has arrived. Mirrors the chat-retention
  // cron (ScheduleModule is registered globally in AppModule).
  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    const now = new Date();
    const due = await this.prisma.blog.findMany({
      where: { status: ContentStatus.SCHEDULED, publishAt: { lte: now } },
      select: { id: true, publishAt: true, publishDate: true },
    });
    if (due.length === 0) return;

    await Promise.all(
      due.map((b) =>
        this.prisma.blog.update({
          where: { id: b.id },
          data: {
            status: ContentStatus.PUBLISHED,
            isPublished: true,
            publishDate: b.publishDate ?? b.publishAt ?? now,
          },
        }),
      ),
    );
    this.logger.log(`Auto-published ${due.length} scheduled blog post(s).`);
  }
}
