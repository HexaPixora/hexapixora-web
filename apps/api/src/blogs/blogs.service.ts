import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Auto calculate read time (~200 words per minute)
    if (data.content) {
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      data.readTime = Math.ceil(wordCount / 200);
    }
    return this.prisma.blog.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; category?: string; published?: boolean } = {}) {
    const { page = 1, limit = 10, category, published } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (published !== undefined) where.isPublished = published;

    const [data, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true, category: true,
          tags: true, thumbnail: true, isPublished: true, publishDate: true,
          createdAt: true, updatedAt: true,
        },
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
      select: { id: true, title: true, slug: true, excerpt: true, thumbnail: true, publishDate: true, category: true },
    });
  }

  async findCategories() {
    const blogs = await this.prisma.blog.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
    });
    return blogs.map(b => b.category).filter(Boolean);
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    if (data.content) {
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      data.readTime = Math.ceil(wordCount / 200);
    }
    return this.prisma.blog.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.blog.delete({ where: { id } });
  }
}
