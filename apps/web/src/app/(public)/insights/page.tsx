import React, { Suspense } from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles, BookOpen } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";
import { InsightCard, CategoryChip, formatInsightDate, insightExcerpt, insightPostUrl } from "@/components/public/insight-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights | HexaPixora",
  description:
    "Ideas, stories and deep-dives on design, development, marketing and technology from the HexaPixora team.",
  alternates: {
    canonical: "/insights",
    types: { "application/rss+xml": "/insights/feed.xml" },
  },
};

async function getInsights() {
  try {
    const res = await fetch(apiUrl("/blogs?published=true&limit=100"), { cache: "no-store" });
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/categories"), { cache: "no-store" });
    return await res.json();
  } catch {
    return [];
  }
}

function FeaturedSpotlight({ post }: { post: any }) {
  const cat = post.categories?.[0];
  const date = post.publishDate || post.createdAt;
  return (
    <Link
      href={insightPostUrl(post)}
      className="group relative grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-[0_40px_90px_-40px_rgba(16,147,253,0.55)] ring-1 ring-inset ring-white/10 transition-all duration-500 hover:border-white/20 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950">
            <BookOpen className="h-12 w-12 text-white/30" />
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r" />
        <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-[#1093fd]/40 bg-[#1093fd]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          <Sparkles size={12} /> Featured
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
        <CategoryChip category={cat} className="self-start" />
        <h2 className="text-2xl font-black leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-[#7cc4ff] md:text-4xl">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{insightExcerpt(post, 220)}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {formatInsightDate(date)}</span>
          {post.readTime ? <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {post.readTime} min read</span> : null}
        </div>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7cc4ff]">
          Read insight <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

function FeedSkeleton() {
  return (
    <div className="container relative z-10">
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/[0.05]" />
        ))}
      </div>
      <div className="space-y-10">
        <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ring-1 ring-inset ring-white/10">
              <div className="aspect-[16/10] animate-pulse bg-white/[0.05]" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-white/[0.08]" />
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Data-dependent section — suspended so the hero paints instantly and this
// streams in with a skeleton. Kept out of the category/post pages so their
// notFound() still returns a real 404 (a route-level loading.tsx would soft-404).
async function InsightsFeed() {
  const [posts, categories] = await Promise.all([getInsights(), getCategories()]);
  const featured = posts[0];
  const rest = posts.slice(1);

  if (posts.length === 0) {
    return (
      <div className="container relative z-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-14 text-center ring-1 ring-inset ring-white/10">
          <BookOpen size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-lg font-bold">No insights yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">New articles are on the way — check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {categories.length > 0 && (
        <div className="container relative z-10 mb-12 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(16,147,253,0.8)]">
            All
          </span>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/insights/${cat.slug}`}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-inset ring-white/10 transition-all hover:border-white/20 hover:text-foreground"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <div className="container relative z-10 space-y-10 lg:space-y-14">
        {featured && <FeaturedSpotlight post={featured} />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p: any) => (
              <InsightCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function InsightsPage() {
  return (
    <SiteLayout showHeader showFooter>
      <div className="relative isolate flex-1 overflow-hidden pb-24">
        {/* Ambient aurora */}
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 -z-10 h-[46vh] w-[46vh] rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-40 -z-10 h-[42vh] w-[42vh] rounded-full bg-[rgba(80,60,220,0.12)] blur-[130px]" />

        {/* Hero (static — paints immediately) */}
        <header className="container relative z-10 max-w-3xl pb-10 pt-16 text-center md:pt-24">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10 backdrop-blur-xl">
            <Sparkles size={13} /> Insights
          </span>
          <h1 className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-6xl">
            The HexaPixora Journal
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Ideas, stories and deep-dives on design, engineering and building modern digital brands.
          </p>
        </header>

        <Suspense fallback={<FeedSkeleton />}>
          <InsightsFeed />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
