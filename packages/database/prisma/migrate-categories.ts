/**
 * One-off backfill: turn legacy free-text `Blog.category` values into managed
 * `Category` rows and link each post via the new many-to-many relation.
 * Idempotent — safe to run more than once. Run before dropping Blog.category:
 *   npx tsx prisma/migrate-categories.ts   (from packages/database)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(name: string): Promise<string> {
  const root = slugify(name) || "category";
  let candidate = root;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

async function main() {
  const blogs = await prisma.blog.findMany({
    where: { category: { not: null } },
    select: { id: true, category: true },
  });

  // name(lowercased) -> category id, preloaded with anything already created.
  const cache = new Map<string, string>();
  for (const c of await prisma.category.findMany({ select: { id: true, name: true } })) {
    cache.set(c.name.toLowerCase(), c.id);
  }

  let created = 0;
  let linked = 0;
  for (const b of blogs) {
    const name = (b.category || "").trim();
    if (!name) continue;
    let id = cache.get(name.toLowerCase());
    if (!id) {
      const cat = await prisma.category.create({ data: { name, slug: await uniqueSlug(name) } });
      id = cat.id;
      cache.set(name.toLowerCase(), id);
      created += 1;
    }
    await prisma.blog.update({ where: { id: b.id }, data: { categories: { connect: { id } } } });
    linked += 1;
  }

  console.log(`[migrate-categories] ${created} categories created, ${linked} posts linked.`);
}

main()
  .catch((err) => {
    console.error("[migrate-categories] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
