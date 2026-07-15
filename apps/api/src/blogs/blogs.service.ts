import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentStatus } from '@prisma/client';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import AdmZip from 'adm-zip';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService, slugify } from '../categories/categories.service';

// Markdown → HTML for imported posts. html:false escapes raw HTML in the source
// so imported files can't inject markup into the rendered article.
const mdParser = new MarkdownIt({ html: false, linkify: true, typographer: true });

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(
    private prisma: PrismaService,
    private categories: CategoriesService,
  ) {}

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

  // --- Bulk import from Markdown files / .zip bundles (admin) ---------------

  async importFiles(
    files: Array<{ originalname?: string; buffer: Buffer }>,
    opts: { overwrite?: boolean; publish?: boolean } = {},
  ) {
    const docs = this.collectMarkdownDocs(files || []);
    type Result = {
      file: string;
      status: 'imported' | 'updated' | 'skipped' | 'failed';
      slug?: string;
      message?: string;
    };
    const results: Result[] = [];

    for (const doc of docs) {
      try {
        const parsed = matter(doc.raw);
        const fm: Record<string, any> = parsed.data || {};
        const body = (parsed.content || '').trim();
        const title = String(fm.title || '').trim();

        if (!title) {
          results.push({ file: doc.name, status: 'failed', message: 'Missing "title" in front matter' });
          continue;
        }
        if (!body) {
          results.push({ file: doc.name, status: 'failed', message: 'The file has no body content' });
          continue;
        }

        const slug = slugify(String(fm.slug || title));
        if (!slug) {
          results.push({ file: doc.name, status: 'failed', message: 'Could not derive a slug' });
          continue;
        }

        const categoryNames = this.toStringArray(fm.categories);
        const categoryIds = categoryNames.length ? await this.categories.ensureByNames(categoryNames) : [];

        let status = this.resolveImportStatus(fm.status, opts.publish);
        const publishAt = fm.publishAt ? new Date(fm.publishAt) : null;
        if (status === ContentStatus.SCHEDULED && (!publishAt || isNaN(publishAt.getTime()))) {
          status = ContentStatus.DRAFT; // scheduling needs a valid publishAt
        }

        const data: Record<string, any> = {
          title,
          slug,
          content: mdParser.render(body),
          tags: this.toStringArray(fm.tags),
          status,
          categoryIds,
          ...(fm.excerpt ? { excerpt: String(fm.excerpt) } : {}),
          ...(fm.thumbnail ? { thumbnail: String(fm.thumbnail) } : {}),
          ...(fm.metaTitle ? { metaTitle: String(fm.metaTitle) } : {}),
          ...(fm.metaDescription ? { metaDescription: String(fm.metaDescription) } : {}),
          ...(fm.metaKeywords ? { metaKeywords: String(fm.metaKeywords) } : {}),
          ...(fm.ogImage ? { ogImage: String(fm.ogImage) } : {}),
          ...(status === ContentStatus.SCHEDULED && publishAt ? { publishAt: publishAt.toISOString() } : {}),
        };

        const existing = await this.prisma.blog.findUnique({ where: { slug }, select: { id: true } });
        if (existing && !opts.overwrite) {
          results.push({ file: doc.name, status: 'skipped', slug, message: 'A post with this slug already exists' });
          continue;
        }

        const post = existing ? await this.update(existing.id, data) : await this.create(data);

        // Honor an explicit `date`/`publishDate` for migrating historical posts,
        // overriding the auto-"now" stamp applied on publish.
        const explicit = fm.date || fm.publishDate;
        if (explicit) {
          const d = new Date(explicit);
          if (!isNaN(d.getTime())) {
            await this.prisma.blog.update({ where: { id: post.id }, data: { publishDate: d } });
          }
        }

        results.push({ file: doc.name, status: existing ? 'updated' : 'imported', slug });
      } catch (err) {
        results.push({ file: doc.name, status: 'failed', message: (err as Error).message?.slice(0, 200) });
      }
    }

    const count = (s: Result['status']) => results.filter((r) => r.status === s).length;
    const summary = {
      total: results.length,
      imported: count('imported'),
      updated: count('updated'),
      skipped: count('skipped'),
      failed: count('failed'),
      results,
    };
    this.logger.log(
      `Blog import: ${summary.imported} new, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.failed} failed.`,
    );
    return summary;
  }

  // Expand uploaded files into { name, raw } markdown docs — .md/.markdown as-is,
  // plus any .md entries found inside a .zip bundle.
  private collectMarkdownDocs(files: Array<{ originalname?: string; buffer: Buffer }>) {
    const docs: Array<{ name: string; raw: string }> = [];
    for (const f of files) {
      const name = f.originalname || 'file';
      if (/\.zip$/i.test(name)) {
        try {
          const zip = new AdmZip(f.buffer);
          for (const entry of zip.getEntries()) {
            if (entry.isDirectory) continue;
            if (entry.entryName.startsWith('__MACOSX')) continue;
            if (!/\.(md|markdown)$/i.test(entry.entryName)) continue;
            docs.push({ name: entry.entryName, raw: entry.getData().toString('utf8') });
          }
        } catch {
          docs.push({ name, raw: '' }); // unreadable zip → fails validation, reported
        }
      } else if (/\.(md|markdown)$/i.test(name)) {
        docs.push({ name, raw: f.buffer.toString('utf8') });
      }
    }
    return docs;
  }

  private toStringArray(value: any): string[] {
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
    if (value === undefined || value === null || value === '') return [];
    return String(value).split(',').map((v) => v.trim()).filter(Boolean);
  }

  private resolveImportStatus(fmStatus: any, publish?: boolean): ContentStatus {
    const s = String(fmStatus || '').toUpperCase();
    if (s === 'PUBLISHED') return ContentStatus.PUBLISHED;
    if (s === 'SCHEDULED') return ContentStatus.SCHEDULED;
    if (s === 'DRAFT') return ContentStatus.DRAFT;
    return publish ? ContentStatus.PUBLISHED : ContentStatus.DRAFT;
  }

  private applyReadTime(data: any) {
    if (data.content) {
      const wordCount = data.content.replace(/<[^<>]*>?/g, ' ').split(/\s+/).length;
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

    // Auto-stamp the publish date to the current time whenever a post is
    // (re)published — on create AND on every edit — so it always reflects the
    // latest publish/edit time. (Scheduled posts stay untouched here; the cron
    // stamps their date when it flips them live.)
    if (data.isPublished) data.publishDate = new Date();
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
