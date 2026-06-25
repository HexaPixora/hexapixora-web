import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Public list — includes a post count for archive/admin display.
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { blogs: true } } },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || 'category';
    let candidate = root;
    let n = 1;
    // Append -2, -3, … until free (ignoring the row being updated).
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const hit = await this.prisma.category.findUnique({ where: { slug: candidate } });
      if (!hit || hit.id === excludeId) return candidate;
      n += 1;
      candidate = `${root}-${n}`;
    }
  }

  async create(dto: { name: string; slug?: string; description?: string; color?: string }) {
    const name = dto.name.trim();
    if (await this.prisma.category.findUnique({ where: { name } })) {
      throw new ConflictException('A category with this name already exists');
    }
    const slug = await this.uniqueSlug(dto.slug || name);
    return this.prisma.category.create({
      data: { name, slug, description: dto.description, color: dto.color },
    });
  }

  async update(
    id: string,
    dto: { name?: string; slug?: string; description?: string; color?: string },
  ) {
    if (!(await this.prisma.category.findUnique({ where: { id } }))) {
      throw new NotFoundException('Category not found');
    }
    const data: any = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const dup = await this.prisma.category.findFirst({ where: { name, id: { not: id } } });
      if (dup) throw new ConflictException('A category with this name already exists');
      data.name = name;
    }
    if (dto.slug !== undefined) data.slug = await this.uniqueSlug(dto.slug, id);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.color !== undefined) data.color = dto.color;
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    if (!(await this.prisma.category.findUnique({ where: { id } }))) {
      throw new NotFoundException('Category not found');
    }
    // M2M links to blogs are cleared automatically; posts themselves are kept.
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  // Resolve category names to ids, creating any that don't exist yet. Used by
  // the legacy-category migration and tolerant of duplicates/casing/whitespace.
  async ensureByNames(names: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const raw of names) {
      const name = (raw ?? '').trim();
      if (!name) continue;
      const existing = await this.prisma.category.findUnique({ where: { name } });
      if (existing) {
        ids.push(existing.id);
        continue;
      }
      const slug = await this.uniqueSlug(name);
      const created = await this.prisma.category.create({ data: { name, slug } });
      ids.push(created.id);
    }
    return ids;
  }
}
