import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentStatus } from '@prisma/client';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import TurndownService from 'turndown';
import AdmZip from 'adm-zip';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService, slugify } from '../categories/categories.service';

// Markdown → HTML for imported posts. html:false escapes raw HTML in the source
// so imported files can't inject markup into the rendered article.
const mdParser = new MarkdownIt({ html: false, linkify: true, typographer: true });
// HTML → Markdown for export.
const htmlToMd = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });

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

  // --- Bulk import (preview + commit) and export ---------------------------

  // Parse uploaded files with NO DB writes, for the import preview: fields,
  // heading outline, missing-field warnings, and whether each slug already
  // exists (so the editor can review/bulk-edit before committing).
  async previewImport(files: Array<{ originalname?: string; buffer: Buffer }>) {
    const docs = this.collectMarkdownDocs(files || []);
    const posts: any[] = [];
    for (const doc of docs) {
      const parsed = this.parseDoc(doc.name, doc.raw);
      const willOverwrite = parsed.ok
        ? Boolean(await this.prisma.blog.findUnique({ where: { slug: parsed.slug }, select: { id: true } }))
        : false;
      posts.push({ ...parsed, willOverwrite });
    }
    return { posts };
  }

  // Save the (possibly edited) posts returned from the preview.
  async commitImport(posts: Array<Record<string, any>>, overwrite = false) {
    type Result = { file: string; slug?: string; status: 'imported' | 'updated' | 'skipped' | 'failed'; message?: string };
    const results: Result[] = [];

    for (const p of posts || []) {
      const file = String(p.file || p.title || 'post');
      try {
        const title = String(p.title || '').trim();
        const content = String(p.content || '').trim();
        const slug = slugify(String(p.slug || title));
        if (!title || !content || !slug) {
          results.push({ file, status: 'failed', message: 'Missing title, content or slug' });
          continue;
        }

        const categoryIds = Array.isArray(p.categories) && p.categories.length
          ? await this.categories.ensureByNames(p.categories.map(String))
          : [];

        const data: Record<string, any> = {
          title,
          slug,
          content,
          tags: this.toStringArray(p.tags),
          status: this.resolveImportStatus(p.status),
          categoryIds,
          ...(p.excerpt ? { excerpt: String(p.excerpt) } : {}),
          ...(p.thumbnail ? { thumbnail: String(p.thumbnail) } : {}),
          ...(p.ogImage ? { ogImage: String(p.ogImage) } : {}),
          ...(p.metaTitle ? { metaTitle: String(p.metaTitle) } : {}),
          ...(p.metaDescription ? { metaDescription: String(p.metaDescription) } : {}),
          ...(p.metaKeywords ? { metaKeywords: String(p.metaKeywords) } : {}),
          ...(Array.isArray(p.faq) && p.faq.length ? { faq: p.faq } : {}),
        };

        const existing = await this.prisma.blog.findUnique({ where: { slug }, select: { id: true } });
        if (existing && !overwrite) {
          results.push({ file, slug, status: 'skipped', message: 'A post with this slug already exists' });
          continue;
        }

        const saved = existing ? await this.update(existing.id, data) : await this.create(data);

        // Honor an explicit date (migrating historical posts) over the auto-now.
        if (p.date) {
          const d = new Date(p.date);
          if (!isNaN(d.getTime())) {
            await this.prisma.blog.update({ where: { id: saved.id }, data: { publishDate: d } });
          }
        }
        results.push({ file, slug, status: existing ? 'updated' : 'imported' });
      } catch (err) {
        results.push({ file, status: 'failed', message: (err as Error).message?.slice(0, 200) });
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
      `Blog import committed: ${summary.imported} new, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.failed} failed.`,
    );
    return summary;
  }

  // Export posts (all, or a given set of ids) as a .zip of Markdown files.
  async exportPosts(ids?: string[]) {
    const where = ids && ids.length ? { id: { in: ids } } : {};
    const posts = await this.prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { categories: { select: { name: true } } },
    });

    const zip = new AdmZip();
    for (const post of posts) {
      const front: Record<string, any> = { title: post.title, slug: post.slug, status: post.status };
      if (post.excerpt) front.excerpt = post.excerpt;
      const cats = post.categories.map((c) => c.name);
      if (cats.length) front.categories = cats;
      const tags = Array.isArray(post.tags) ? post.tags : [];
      if (tags.length) front.tags = tags;
      if (post.thumbnail) front.thumbnail = post.thumbnail;
      if (post.ogImage) front.ogImage = post.ogImage;
      if (post.metaTitle) front.metaTitle = post.metaTitle;
      if (post.metaDescription) front.metaDescription = post.metaDescription;
      if (post.metaKeywords) front.metaKeywords = post.metaKeywords;
      if (post.publishDate) front.date = post.publishDate.toISOString().slice(0, 10);

      const md = htmlToMd.turndown(post.content || '');
      const fileContent = matter.stringify(`\n${md}\n`, front);
      zip.addFile(`${post.slug || post.id}.md`, Buffer.from(fileContent, 'utf8'));
    }
    return { filename: `hexapixora-posts-${posts.length}.zip`, buffer: zip.toBuffer() };
  }

  // Parse one markdown doc into a structured preview record (no DB writes).
  private parseDoc(file: string, raw: string) {
    const base = {
      file,
      ok: false,
      error: undefined as string | undefined,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      categories: [] as string[],
      tags: [] as string[],
      thumbnail: '',
      ogImage: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      status: 'DRAFT' as string,
      date: '',
      headings: [] as { level: number; text: string }[],
      warnings: [] as string[],
      faq: [] as { question: string; answer: string }[],
    };

    let fm: Record<string, any>;
    let body: string;
    try {
      const parsed = matter(raw);
      fm = parsed.data || {};
      body = (parsed.content || '').trim();
    } catch (err) {
      return { ...base, error: `Invalid front matter: ${(err as Error).message?.slice(0, 120)}` };
    }

    const title = String(fm.title || '').trim();
    if (!title) return { ...base, error: 'Missing "title" in front matter' };
    if (!body) return { ...base, title, error: 'The file has no body content' };
    const slug = slugify(String(fm.slug || title));
    if (!slug) return { ...base, title, error: 'Could not derive a slug' };

    const categories = this.toStringArray(fm.categories);
    const excerpt = fm.excerpt ? String(fm.excerpt) : '';
    const thumbnail = fm.thumbnail ? String(fm.thumbnail) : '';
    const ogImage = fm.ogImage ? String(fm.ogImage) : '';
    const rawDate = fm.date || fm.publishDate;
    const date = rawDate ? new Date(rawDate) : null;

    const { content, faq } = this.extractContentAndFaq(body);

    const warnings: string[] = [];
    if (!excerpt) warnings.push('No excerpt');
    if (!categories.length) warnings.push('No categories');
    if (!thumbnail) warnings.push('No featured image');
    if (!ogImage) warnings.push('No OG image');
    if (!faq.length) warnings.push('No FAQ');

    return {
      ...base,
      ok: true,
      title,
      slug,
      excerpt,
      content,
      faq,
      categories,
      tags: this.toStringArray(fm.tags),
      thumbnail,
      ogImage,
      metaTitle: fm.metaTitle ? String(fm.metaTitle) : '',
      metaDescription: fm.metaDescription ? String(fm.metaDescription) : '',
      metaKeywords: fm.metaKeywords ? String(fm.metaKeywords) : '',
      status: this.resolveImportStatus(fm.status),
      date: date && !isNaN(date.getTime()) ? date.toISOString() : '',
      headings: this.extractHeadings(body),
      warnings,
    };
  }

  private extractHeadings(body: string) {
    const out: { level: number; text: string }[] = [];
    for (const line of body.split('\n')) {
      const m = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
      if (m) out.push({ level: m[1]!.length, text: m[2]!.trim() });
    }
    return out;
  }

  // Split a post body into rendered HTML content + a structured FAQ. Drops any
  // trailing "Related Articles" section (the page shows auto-related posts) and
  // pulls the "Frequently Asked Questions" section out into { question, answer }
  // pairs so it's stored as a real field, not baked into the content.
  private extractContentAndFaq(body: string): {
    content: string;
    faq: { question: string; answer: string }[];
  } {
    const main = body.replace(/\n#{1,6}\s+Related Articles[\s\S]*$/i, '').trim();

    const faqMatch = main.match(/\n#{1,6}\s+(?:Frequently Asked Questions|FAQs?)\s*\n/i);
    if (!faqMatch || faqMatch.index === undefined) {
      return { content: mdParser.render(main), faq: [] };
    }

    const before = main.slice(0, faqMatch.index).trim();
    const faqBody = main.slice(faqMatch.index + faqMatch[0].length).trim();
    const faq = faqBody
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((item) => {
        const m = item.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
        if (!m) return null;
        return { question: m[1]!.trim(), answer: m[2]!.replace(/\s+/g, ' ').trim() };
      })
      .filter((x): x is { question: string; answer: string } => !!x?.question && !!x?.answer);

    return { content: mdParser.render(before), faq };
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

  private resolveImportStatus(fmStatus: any): ContentStatus {
    return String(fmStatus || '').toUpperCase() === 'PUBLISHED'
      ? ContentStatus.PUBLISHED
      : ContentStatus.DRAFT;
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
