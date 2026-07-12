import React from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

/** Canonical URL for a post: /insights/<primary-category>/<slug>. Posts without
 *  a category fall back to an "uncategorized" segment so the URL stays 2-deep. */
export function insightPostUrl(post: any): string {
  const cat = post?.categories?.[0]?.slug || "uncategorized";
  return `/insights/${cat}/${post.slug}`;
}

export function formatInsightDate(d?: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function insightExcerpt(post: any, max = 150): string {
  if (post?.excerpt) return post.excerpt;
  const text = String(post?.content || "").replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Premium gradient fallback when a post has no featured image. */
function ImageFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950">
      <span className="bg-gradient-to-b from-white/70 to-white/20 bg-clip-text text-5xl font-black tracking-tight text-transparent">
        {(label || "H").charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function CategoryChip({ category, className = "" }: { category?: any; className?: string }) {
  if (!category?.name) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md ${className}`}
      style={category.color ? { borderColor: category.color, backgroundColor: `${category.color}22` } : undefined}
    >
      {category.name}
    </span>
  );
}

export function InsightCard({ post, className = "" }: { post: any; className?: string }) {
  const cat = post.categories?.[0];
  const date = post.publishDate || post.createdAt;

  return (
    <Link
      href={insightPostUrl(post)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-white/20 ${className}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <ImageFallback label={cat?.name || post.title} />
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <CategoryChip category={cat} className="absolute left-4 top-4" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {formatInsightDate(date)}</span>
          {post.readTime ? <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {post.readTime} min read</span> : null}
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-[#7cc4ff]">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{insightExcerpt(post)}</p>
        <div className="mt-auto flex items-center gap-1.5 border-t border-white/10 pt-4 text-sm font-semibold text-[#7cc4ff]">
          Read insight
          <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
