import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus } from '@prisma/client';

export type SearchResult = {
  type: 'blog' | 'page';
  title: string;
  snippet: string;
  url: string;
};

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search published blogs and pages. v1 uses case-insensitive `contains`
   * (Postgres ILIKE); the result shape is stable so this can later be swapped
   * for full-text search (tsvector + GIN index) without touching callers.
   */
  async search(query: string, limit = 8): Promise<{ results: SearchResult[]; total: number }> {
    const q = (query || '').trim();
    if (q.length < 2) return { results: [], total: 0 };
    const like = { contains: q, mode: 'insensitive' as const };

    const [blogs, pages] = await Promise.all([
      this.prisma.blog.findMany({
        where: {
          isPublished: true,
          OR: [{ title: like }, { excerpt: like }, { content: like }],
        },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          categories: { select: { slug: true }, take: 1 },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.page.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          isHomepage: false,
          OR: [{ title: like }, { metaTitle: like }, { metaDescription: like }],
        },
        select: { title: true, slug: true, metaDescription: true },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const results: SearchResult[] = [
      ...blogs.map((b) => ({
        type: 'blog' as const,
        title: b.title,
        snippet: makeSnippet(b.excerpt || b.content, q),
        url: `/insights/${b.categories[0]?.slug || 'uncategorized'}/${b.slug}`,
      })),
      ...pages.map((p) => ({
        type: 'page' as const,
        title: p.title,
        snippet: makeSnippet(p.metaDescription, q),
        url: `/${p.slug}`,
      })),
    ];

    return { results, total: results.length };
  }
}

/** A short, plain-text snippet, preferring a window around the first match. */
function makeSnippet(text: string | null | undefined, q: string, len = 140): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const idx = clean.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return clean.slice(0, len) + (clean.length > len ? '…' : '');
  const start = Math.max(0, idx - 40);
  const slice = clean.slice(start, start + len);
  return (start > 0 ? '…' : '') + slice + (start + len < clean.length ? '…' : '');
}
