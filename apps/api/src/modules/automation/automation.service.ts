import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, LeadStatus, SubscriptionStatus } from '@prisma/client';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';
import { PrismaService } from '../../prisma/prisma.service';
import { env } from '../../config/env';
import {
  isSupabaseStorageEnabled,
  uploadToSupabase,
} from '../media/supabase-storage';
import { AutomationPostDto } from './dto/automation-post.dto';

// Same settings as the blog importer: raw HTML in the source is escaped.
const mdParser = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

// Hard ceiling on routine-created posts per rolling 24h, so a leaked key or a
// looping run can't flood the blog.
const DAILY_POST_LIMIT = 3;
const AUDIT_ENTITY = 'automation-blog';
const DAILY_IMAGE_LIMIT = 10;
const IMAGE_AUDIT_ENTITY = 'automation-media';

// Raster images only (no SVG: it can carry script). The stored extension comes
// from here, never from the client's filename.
export const AUTOMATION_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private prisma: PrismaService) {}

  // Everything a routine needs before writing: taxonomy and existing posts
  // (to avoid duplicate topics and to pick internal links).
  async context() {
    const [categories, posts] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { name: true, slug: true },
      }),
      this.prisma.blog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
        select: {
          title: true,
          slug: true,
          status: true,
          publishDate: true,
          publishAt: true,
          tags: true,
          metaKeywords: true,
          thumbnail: true,
          categories: { select: { slug: true } },
        },
      }),
    ]);

    return {
      siteUrl: env.appUrl,
      blogPath: '/insights',
      dailyPostLimit: DAILY_POST_LIMIT,
      categories,
      posts: posts.map(({ categories: cats, ...p }) => ({
        ...p,
        categories: cats.map((c) => c.slug),
      })),
    };
  }

  async createPost(dto: AutomationPostDto) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await this.prisma.auditLog.count({
      where: {
        entity: AUDIT_ENTITY,
        action: 'CREATE',
        createdAt: { gte: since },
      },
    });
    if (recent >= DAILY_POST_LIMIT) {
      throw new HttpException(
        `Daily automation limit reached (${DAILY_POST_LIMIT} posts / 24h)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (
      await this.prisma.blog.findUnique({
        where: { slug: dto.slug },
        select: { id: true },
      })
    ) {
      throw new ConflictException(`Slug "${dto.slug}" already exists`);
    }

    if (dto.thumbnail) await this.assertOwnMedia(dto.thumbnail);

    const categoryIds = await this.resolveCategories(dto.categories ?? []);
    const content = mdParser.render(dto.markdown);
    const words = dto.markdown.split(/\s+/).filter(Boolean).length;

    const publishAt = dto.publishAt ? new Date(dto.publishAt) : null;
    const scheduled = publishAt !== null && publishAt.getTime() > Date.now();
    const now = new Date();

    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content,
        readTime: Math.max(1, Math.round(words / 200)),
        tags: dto.tags ?? [],
        thumbnail: dto.thumbnail,
        ogImage: dto.thumbnail,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        faq: dto.faq
          ? dto.faq.map((f) => ({ question: f.question, answer: f.answer }))
          : undefined,
        status: scheduled ? ContentStatus.SCHEDULED : ContentStatus.PUBLISHED,
        isPublished: !scheduled,
        publishAt: scheduled ? publishAt : null,
        publishDate: scheduled ? null : now,
        ...(categoryIds.length
          ? { categories: { connect: categoryIds.map((id) => ({ id })) } }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        status: true,
        publishAt: true,
        publishDate: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: AUDIT_ENTITY,
        entityId: blog.id,
        details: { slug: blog.slug },
      },
    });
    this.logger.log(
      `Automation ${scheduled ? 'scheduled' : 'published'} post "${blog.slug}"`,
    );

    return { ...blog, url: `${env.appUrl}/insights/${blog.slug}` };
  }

  // Store a featured image in the media library (Supabase in production,
  // ./uploads locally), content-addressed like MediaController so re-uploads dedupe.
  async uploadImage(file: {
    buffer: Buffer;
    mimetype: string;
    originalname?: string;
  }) {
    const ext = AUTOMATION_IMAGE_TYPES[file.mimetype];
    if (!ext) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await this.prisma.auditLog.count({
      where: {
        entity: IMAGE_AUDIT_ENTITY,
        action: 'CREATE',
        createdAt: { gte: since },
      },
    });
    if (recent >= DAILY_IMAGE_LIMIT) {
      throw new HttpException(
        `Daily automation limit reached (${DAILY_IMAGE_LIMIT} images / 24h)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const hash = createHash('sha256').update(file.buffer).digest('hex');
    const filename = `${hash}${ext}`;
    const existing = await this.prisma.media.findFirst({ where: { filename } });
    if (existing) return { id: existing.id, url: existing.url, deduped: true };

    let url: string;
    if (isSupabaseStorageEnabled()) {
      url = await uploadToSupabase(filename, file.buffer, file.mimetype);
    } else {
      const dir = path.join(process.cwd(), 'uploads');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), file.buffer);
      url = `/api/media/file/${filename}`;
    }

    const media = await this.prisma.media.create({
      data: {
        filename,
        name: path.basename(file.originalname || filename),
        url,
        mimetype: file.mimetype,
        size: file.buffer.length,
        folder: 'blog',
      },
    });
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: IMAGE_AUDIT_ENTITY,
        entityId: media.id,
      },
    });
    return { id: media.id, url: media.url, deduped: false };
  }

  // Attach a library image to a post this API created. Hand-written posts are
  // off limits, and the image must already be in our media library.
  async setPostImage(slug: string, url: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!blog) throw new NotFoundException(`Post "${slug}" not found`);

    const ownedByAutomation = await this.prisma.auditLog.count({
      where: { entity: AUDIT_ENTITY, action: 'CREATE', entityId: blog.id },
    });
    if (!ownedByAutomation) {
      throw new ForbiddenException(
        'Only posts created by the automation API can be edited',
      );
    }
    await this.assertOwnMedia(url);

    await this.prisma.blog.update({
      where: { id: blog.id },
      data: { thumbnail: url, ogImage: url },
    });
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: AUDIT_ENTITY,
        entityId: blog.id,
        details: { thumbnail: url },
      },
    });
    return { slug, thumbnail: url };
  }

  private async assertOwnMedia(url: string) {
    const media = await this.prisma.media.findFirst({
      where: { url },
      select: { id: true },
    });
    if (!media) {
      throw new BadRequestException(
        'Image must be uploaded via POST /automation/media first',
      );
    }
  }

  // Weekly digest: leads (CRM), newsletter, content output and API health.
  async report(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dbStart = Date.now();

    const [
      newLeads,
      openLeadsByStatus,
      newSubscribers,
      activeSubscribers,
      publishedInPeriod,
      scheduled,
      drafts,
      totalPublished,
    ] = await Promise.all([
      this.prisma.lead.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          name: true,
          email: true,
          phone: true,
          country: true,
          type: true,
          status: true,
          message: true,
          createdAt: true,
        },
      }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { status: { not: LeadStatus.CLOSED } },
        _count: { _all: true },
      }),
      this.prisma.newsletterSubscriber.count({
        where: { createdAt: { gte: since }, status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.newsletterSubscriber.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.blog.findMany({
        where: { isPublished: true, publishDate: { gte: since } },
        orderBy: { publishDate: 'desc' },
        select: { title: true, slug: true, publishDate: true },
      }),
      this.prisma.blog.findMany({
        where: { status: ContentStatus.SCHEDULED },
        orderBy: { publishAt: 'asc' },
        select: { title: true, slug: true, publishAt: true },
      }),
      this.prisma.blog.count({ where: { status: ContentStatus.DRAFT } }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);
    const dbLatencyMs = Date.now() - dbStart;
    const mem = process.memoryUsage();

    return {
      period: { days, since },
      leads: {
        newCount: newLeads.length,
        new: newLeads.map((l) => ({
          ...l,
          message: l.message?.slice(0, 400) ?? null,
        })),
        openByStatus: Object.fromEntries(
          openLeadsByStatus.map((g) => [g.status, g._count._all]),
        ),
      },
      newsletter: { newSubscribers, activeSubscribers },
      content: { publishedInPeriod, scheduled, drafts, totalPublished },
      health: {
        dbLatencyMs,
        uptimeSeconds: Math.round(process.uptime()),
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        node: process.version,
      },
    };
  }

  // Match existing categories by name or slug, case-insensitively.
  private async resolveCategories(refs: string[]): Promise<string[]> {
    if (!refs.length) return [];
    const all = await this.prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });
    const wanted = new Set(refs.map((r) => r.trim().toLowerCase()));
    return all
      .filter(
        (c) =>
          wanted.has(c.name.toLowerCase()) || wanted.has(c.slug.toLowerCase()),
      )
      .map((c) => c.id);
  }
}
