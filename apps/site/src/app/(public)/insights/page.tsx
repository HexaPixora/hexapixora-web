import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { apiUrl } from "@hexapixora/sdk/server";
import { safeHref } from "@hexapixora/contracts/links";
import { SiteLayout } from "@/components/public/site-layout";
import { EmptyState } from "@hexapixora/theme-hexa-noir/components/empty-state";
import { PageHeader } from "@hexapixora/theme-hexa-noir/components/page-header";
import {
  CategoryChip,
  InsightCard,
  formatInsightDate,
  insightExcerpt,
  insightPostUrl,
  type InsightPost,
} from "@hexapixora/theme-hexa-noir/components/insight-card";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Insights: Software, Web, AI & Cloud Guides | HexaPixora",
  description:
    "Practical guides on custom software, web development, SaaS, AI automation, cloud and design — written to help business leaders make confident technology decisions.",
  alternates: {
    canonical: "/insights",
    types: { "application/rss+xml": "/insights/feed.xml" },
  },
};

type Category = { id: string; slug: string; name: string };

async function getInsights(): Promise<InsightPost[]> {
  try {
    const res = await fetch(apiUrl("/blogs?published=true&limit=100"), {
      next: { revalidate: 120 },
    });
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(apiUrl("/categories"), {
      next: { revalidate: 120 },
    });
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

/** The newest post, large: image left, text right. The whole card is one link. */
function FeaturedInsight({ post }: { post: InsightPost }) {
  const date = post.publishDate || post.createdAt;
  const thumbnail = safeHref(post.thumbnail);
  return (
    <article className="group relative grid border border-line transition-colors duration-[400ms] hover:bg-page-raised lg:grid-cols-[1.15fr_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden bg-page-raised lg:aspect-auto lg:min-h-[26rem]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        ) : null}
        <span className="mono absolute left-4 top-4 bg-signal px-2.5 py-1 text-on-signal">Latest</span>
      </div>
      <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
        <CategoryChip category={post.categories?.[0]} className="self-start" />
        <h2 className="wide text-promise font-medium">
          <Link href={insightPostUrl(post)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-lg text-copy-dim">{insightExcerpt(post, 200)}</p>
        <p className="mono flex flex-wrap gap-x-4 text-copy-dim">
          {date ? <time dateTime={date}>{formatInsightDate(date)}</time> : null}
          {post.readTime ? <span>{post.readTime} min read</span> : null}
        </p>
        <span aria-hidden="true" className="mono text-signal">
          Read insight →
        </span>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div aria-hidden="true" className="page-width grid gap-12">
      <div className="h-[26rem] animate-pulse border border-line bg-page-raised motion-reduce:animate-none" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-96 animate-pulse border border-line bg-page-raised motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}

// Data-dependent part, suspended so the header paints at once and this streams
// in. Kept out of the category/post pages so their notFound() still returns a
// real 404 (a route-level loading.tsx would soft-404).
async function InsightsFeed() {
  const [posts, categories] = await Promise.all([getInsights(), getCategories()]);
  const [featured, ...rest] = posts;

  if (!featured) {
    return (
      <div className="page-width">
        <EmptyState label="Nothing here yet">New articles are on the way. Check back soon.</EmptyState>
      </div>
    );
  }

  return (
    <div className="page-width grid gap-section">
      <div className="grid gap-chapter">
        {categories.length > 0 ? (
          <nav aria-label="Insight categories" className="-mt-6">
            <ul className="mono flex flex-wrap gap-2">
              <li>
                <span aria-current="page" className="inline-flex border border-copy px-3 py-1.5 text-copy">
                  All
                </span>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/insights/${category.slug}`}
                    className="inline-flex border border-line px-3 py-1.5 text-copy-dim transition-colors hover:border-copy hover:text-copy"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <FeaturedInsight post={featured} />
      </div>

      {rest.length > 0 ? (
        <section aria-labelledby="latest-insights">
          <h2 id="latest-insights" className="mono mb-chapter flex items-center gap-5 text-copy-dim">
            Latest articles
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <li key={post.id ?? post.slug}>
                <InsightCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <SiteLayout showHeader showFooter>
      <div className="pb-section">
        <PageHeader
          eyebrow="Insights"
          title="Insights & ideas"
          intro="Practical guides on software, web, AI, cloud and design, written to help business leaders make confident technology decisions."
        />
        <Suspense fallback={<FeedSkeleton />}>
          <InsightsFeed />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
