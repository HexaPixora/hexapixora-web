import Link from "next/link";
import { safeHref } from "@hexapixora/contracts/links";

export type InsightCategory = { name?: string; slug?: string; color?: string | null };

export type InsightPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  publishDate?: string | null;
  createdAt?: string | null;
  readTime?: number | null;
  categories?: InsightCategory[];
};

/** Canonical URL for a post: /insights/<slug>. Categories share the same flat route. */
export function insightPostUrl(post: Pick<InsightPost, "slug">): string {
  return `/insights/${post.slug}`;
}

export function formatInsightDate(d?: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function insightExcerpt(post: Pick<InsightPost, "excerpt" | "content">, max = 150): string {
  if (post?.excerpt) return post.excerpt;
  const text = String(post?.content || "")
    .replace(/<[^<>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * A category label. The stored category colour is ignored: the theme owns
 * colour, so every category reads the same.
 */
export function CategoryChip({ category, className = "" }: { category?: InsightCategory; className?: string }) {
  if (!category?.name) return null;
  return (
    <span className={`mono inline-flex border border-line bg-page/80 px-2.5 py-1 text-copy ${className}`}>
      {category.name}
    </span>
  );
}

/** An article card: image, category, date, title, excerpt. The whole card is one link. */
export function InsightCard({ post, className = "" }: { post: InsightPost; className?: string }) {
  const category = post.categories?.[0];
  const date = post.publishDate || post.createdAt;
  const thumbnail = safeHref(post.thumbnail);

  return (
    <article
      className={`group relative flex h-full flex-col border border-line bg-page transition-colors duration-[400ms] hover:bg-page-raised ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-page-raised">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <span aria-hidden="true" className="wide grid h-full place-items-center text-display-md text-copy/10">
            {(category?.name || post.title).charAt(0)}
          </span>
        )}
        <CategoryChip category={category} className="absolute left-4 top-4" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mono flex flex-wrap gap-x-4 text-copy-dim">
          {date ? <time dateTime={date}>{formatInsightDate(date)}</time> : null}
          {post.readTime ? <span>{post.readTime} min read</span> : null}
        </p>
        <h3 className="wide mt-3 line-clamp-3 text-title font-medium">
          <Link href={insightPostUrl(post)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-copy-dim">{insightExcerpt(post)}</p>
        <span aria-hidden="true" className="mono mt-auto pt-6 text-signal">
          Read insight →
        </span>
      </div>
    </article>
  );
}
