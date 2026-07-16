import React from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, BookOpen, User } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";
import { cmsFetch } from "@/lib/cms-fetch";
import { siteUrl, absoluteMediaUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { InsightCard, CategoryChip } from "@/components/public/insight-card";
import { FaqAccordion } from "@/components/public/faq-accordion";

export const dynamic = "force-dynamic";

async function getInsight(slug: string) {
  try {
    const res = await cmsFetch(`/blogs/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getRelated(slug: string) {
  try {
    const res = await fetch(apiUrl(`/blogs/slug/${slug}/related?limit=3`), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

interface InsightPageProps {
  params: Promise<{ category: string; slug: string }>;
}

function primaryCategorySlug(post: any): string {
  return post?.categories?.[0]?.slug || "uncategorized";
}

export async function generateMetadata(props: InsightPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getInsight(slug);
  if (!post) return { title: "Insight Not Found | HexaPixora" };

  // Canonical is always the primary-category URL, regardless of which category
  // segment was used to reach the page (prevents duplicate content).
  const canonical = `/insights/${primaryCategorySlug(post)}/${post.slug}`;
  const ogDesc = post.metaDescription || post.excerpt || undefined;
  const rawImage = post.ogImage || post.thumbnail;
  const ogImage = rawImage ? absoluteMediaUrl(rawImage) : undefined;

  const base = {
    title: `${post.metaTitle || post.title} | HexaPixora Insights`,
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

export default async function InsightPage(props: InsightPageProps) {
  const { slug } = await props.params;
  const post = await getInsight(slug);
  if (!post) notFound();

  const related = await getRelated(slug);
  const primaryCat = post.categories?.[0];
  const canonical = siteUrl(`/insights/${primaryCategorySlug(post)}/${post.slug}`);
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
      { "@type": "ListItem", position: 2, name: "Insights", item: siteUrl("/insights") },
      ...(primaryCat
        ? [{ "@type": "ListItem", position: 3, name: primaryCat.name, item: siteUrl(`/insights/${primaryCat.slug}`) }]
        : []),
      { "@type": "ListItem", position: primaryCat ? 4 : 3, name: post.title, item: canonical },
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

  return (
    <SiteLayout showHeader showFooter>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <article className="relative isolate flex-1 overflow-hidden pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(16,147,253,0.14),transparent)]" />

        <div className="container relative z-10 max-w-6xl pt-8 md:pt-12">
          <Link
            href="/insights"
            className="group mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-[#7cc4ff]"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Insights
          </Link>

          <div className="space-y-6">
            {Array.isArray(post.categories) && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((c: any) => (
                  <Link key={c.id} href={`/insights/${c.slug}`}>
                    <CategoryChip category={c} className="transition-transform hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            )}

            <h1 className="bg-gradient-to-b from-white to-white/65 bg-clip-text text-3xl font-black leading-[1.12] tracking-tight text-transparent md:text-5xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/10 py-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1093fd]/15 text-[#7cc4ff]">
                  <User size={13} />
                </span>
                <span className="font-medium text-foreground/90">HexaPixora Team</span>
              </span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              {post.readTime ? <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {post.readTime} min read</span> : null}
            </div>
          </div>

          {image && (
            <figure className="relative my-10 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_40px_100px_-40px_rgba(16,147,253,0.5)] ring-1 ring-inset ring-white/10">
              <div className="aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={post.title} className="h-full w-full object-cover" />
              </div>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </figure>
          )}

          <div
            className="prose prose-lg mt-10 max-w-none break-words text-foreground/90 dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#7cc4ff] hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {faq.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-6 text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <FaqAccordion items={faq} />
            </section>
          )}

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="container relative z-10 mt-20 max-w-6xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BookOpen size={20} className="text-[#7cc4ff]" /> Continue Reading
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r: any) => (
                <InsightCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
