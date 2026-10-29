import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiUrl, cmsFetch, readResource } from "@hexapixora/sdk/server";
import { safeHref } from "@hexapixora/contracts/links";
import { SiteLayout } from "@/components/public/site-layout";
import { siteUrl, absoluteMediaUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { CategoryChip, InsightCard, type InsightPost } from "@hexapixora/theme-hexa-noir/components/insight-card";
import { InsightCategoryView } from "@hexapixora/theme-hexa-noir/components/insight-category-view";
import { FaqDetails } from "@hexapixora/theme-hexa-noir/components/faq-details";

export const revalidate = 120;

// URLs are fully flat: /insights/<slug> is EITHER a post or a category. Resolve
// the post first (posts take precedence on a slug clash), then fall back to a
// category. Wrapped in cache() so generateMetadata and the page share one fetch
// per request instead of hitting the API twice.
// A missing post/category returns null (→ notFound); an unreachable API throws
// instead, so an outage is never cached as a 404.
const getInsight = cache(async (slug: string) => {
  const res = await cmsFetch(`/blogs/slug/${slug}`, {
    next: { revalidate: 120 },
  }).catch(() => null);
  return readResource(res);
});

const getCategory = cache(async (slug: string) => {
  const res = await fetch(apiUrl(`/categories/${slug}`), {
    next: { revalidate: 120 },
  }).catch(() => null);
  return readResource(res);
});

async function getRelated(slug: string) {
  try {
    const res = await fetch(apiUrl(`/blogs/slug/${slug}/related?limit=3`), {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getCategoryPosts(slug: string) {
  try {
    const res = await fetch(apiUrl(`/blogs?published=true&limit=100&category=${encodeURIComponent(slug)}`), {
      next: { revalidate: 120 },
    });
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

interface InsightPageProps {
  params: Promise<{ slug: string }>;
}

// Search results show ~60 characters of a title, so the brand suffix is only
// added when it still fits.
const TITLE_SUFFIX = " | HexaPixora Insights";
const withSuffix = (title: string) => (title.length + TITLE_SUFFIX.length <= 60 ? `${title}${TITLE_SUFFIX}` : title);

export async function generateMetadata(props: InsightPageProps): Promise<Metadata> {
  const { slug } = await props.params;

  const post = await getInsight(slug);
  if (post) {
    const canonical = `/insights/${post.slug}`;
    const ogDesc = post.metaDescription || post.excerpt || undefined;
    const rawImage = post.ogImage || post.thumbnail;
    const ogImage = rawImage ? absoluteMediaUrl(rawImage) : undefined;

    const base = {
      title: withSuffix(post.metaTitle || post.title),
      description: post.metaDescription || post.excerpt || `Read our latest insight: ${post.title}`,
      keywords: post.metaKeywords || undefined,
      alternates: { canonical },
    };
    if (!ogImage) return base;
    return {
      ...base,
      openGraph: {
        type: "article",
        title: post.title,
        description: ogDesc,
        url: siteUrl(canonical),
        images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: ogDesc,
        images: [ogImage],
      },
    };
  }

  const category = await getCategory(slug);
  if (category) {
    return {
      title: `${category.name} | HexaPixora Insights`,
      description: category.description || `Insights in the ${category.name} category.`,
      alternates: { canonical: `/insights/${category.slug}` },
    };
  }

  return { title: "Not Found | HexaPixora" };
}

export default async function InsightPage(props: InsightPageProps) {
  const { slug } = await props.params;

  const post = await getInsight(slug);

  // Not a post — maybe the slug is a category.
  if (!post) {
    const category = await getCategory(slug);
    if (!category) notFound();
    const posts = await getCategoryPosts(slug);
    return (
      <SiteLayout showHeader showFooter>
        <InsightCategoryView category={category} posts={posts} />
      </SiteLayout>
    );
  }

  const related = await getRelated(slug);
  const primaryCat = post.categories?.[0];
  const canonical = siteUrl(`/insights/${post.slug}`);
  const date = post.publishDate || post.createdAt;
  const image = post.ogImage || post.thumbnail;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: image ? absoluteMediaUrl(image) : undefined,
    datePublished: post.publishDate || post.createdAt || undefined,
    dateModified: post.updatedAt || post.publishDate || post.createdAt || undefined,
    ...(primaryCat?.name ? { articleSection: primaryCat.name } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    publisher: { "@type": "Organization", name: "HexaPixora" },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: siteUrl("/insights"),
      },
      ...(primaryCat
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: primaryCat.name,
              item: siteUrl(`/insights/${primaryCat.slug}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: primaryCat ? 4 : 3,
        name: post.title,
        item: canonical,
      },
    ],
  };
  const faq: { question: string; answer: string }[] = Array.isArray(post.faq) ? post.faq : [];
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const heroImage = safeHref(image);
  const tags: string[] = Array.isArray(post.tags) ? post.tags.filter((tag: unknown) => typeof tag === "string") : [];
  const categories: { id: string; slug: string; name: string }[] = Array.isArray(post.categories)
    ? post.categories
    : [];

  return (
    <SiteLayout showHeader showFooter>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <article className="pb-section">
        <header className="page-width pt-16 md:pt-24">
          <div className="max-w-[52rem]">
            <nav aria-label="Breadcrumb" className="mono text-copy-dim">
              <Link href="/insights" className="transition-colors hover:text-signal">
                <span aria-hidden="true">← </span>Insights
              </Link>
            </nav>
            {categories.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/insights/${category.slug}`} className="group">
                      <CategoryChip category={category} className="transition-colors group-hover:border-copy" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <h1 className="wide mt-6 text-statement font-medium">{post.title}</h1>
            <p className="mono mt-8 flex flex-wrap gap-x-5 gap-y-1 border-y border-line py-4 text-copy-dim">
              <span className="text-copy">HexaPixora Team</span>
              {date ? (
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              ) : null}
              {post.readTime ? <span>{post.readTime} min read</span> : null}
            </p>
          </div>
          {heroImage ? (
            <figure className="mt-12 aspect-[16/9] overflow-hidden border border-line bg-page-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt={post.title} decoding="async" className="h-full w-full object-cover" />
            </figure>
          ) : null}
        </header>

        <div className="page-width">
          <div className="max-w-[52rem]">
            <div
              className="prose prose-lg prose-invert noir-prose mt-14 max-w-none break-words"
              // Cleaned in the API on save. The page header already renders the
              // title as the only <h1>; imported posts often repeat it in the
              // body, so those are demoted.
              dangerouslySetInnerHTML={{
                __html: String(post.content ?? "").replace(/<(\/?)h1(?=[\s>])/gi, "<$1h2"),
              }}
            />

            {faq.length > 0 ? (
              <section aria-labelledby="article-faq" className="mt-section">
                <h2 id="article-faq" className="wide mb-chapter text-promise font-medium">
                  Frequently asked questions
                </h2>
                <FaqDetails items={faq} />
              </section>
            ) : null}

            {tags.length > 0 ? (
              <ul aria-label="Tags" className="mono mt-14 flex flex-wrap gap-2 border-t border-line pt-6 text-copy-dim">
                {tags.map((tag) => (
                  <li key={tag} className="border border-line px-2.5 py-1">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-insights" className="page-width mt-section">
            <h2 id="related-insights" className="mono mb-chapter flex items-center gap-5 text-copy-dim">
              Continue reading
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(related as InsightPost[]).map((item) => (
                <li key={item.id ?? item.slug}>
                  <InsightCard post={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </SiteLayout>
  );
}
