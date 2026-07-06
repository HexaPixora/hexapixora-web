import React from "react";
import SiteLayout from "@/components/public/site-layout";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { Metadata } from "next";
import { apiUrl } from "@/lib/api-url";
import { InsightCard, insightPostUrl } from "@/components/public/insight-card";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  try {
    const res = await fetch(apiUrl(`/categories/${slug}`), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(apiUrl(`/blogs/slug/${slug}`), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPosts(slug: string) {
  try {
    const res = await fetch(
      apiUrl(`/blogs?published=true&limit=100&category=${encodeURIComponent(slug)}`),
      { cache: "no-store" },
    );
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return { title: "HexaPixora Insights" };
  return {
    title: `${category.name} | HexaPixora Insights`,
    description: category.description || `Insights in the ${category.name} category.`,
    alternates: { canonical: `/insights/${category.slug}` },
  };
}

export default async function InsightCategoryPage(props: { params: Promise<{ category: string }> }) {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);

  // Not a category — this single segment might be a legacy/bare post slug
  // (old /blog/:slug → /insights/:slug). Resolve it and 308 to its canonical
  // /insights/<category>/<slug> URL; otherwise it's genuinely not found.
  if (!category) {
    const post = await getPostBySlug(slug);
    if (post?.slug) permanentRedirect(insightPostUrl(post));
    notFound();
  }

  const posts = await getPosts(slug);

  return (
    <SiteLayout showHeader showFooter>
      <div className="relative isolate flex-1 overflow-hidden pb-24">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-0 -z-10 h-[42vh] w-[42vh] rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />

        <header className="container relative z-10 max-w-3xl pb-4 pt-16 text-center md:pt-24">
          <span
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10 backdrop-blur-xl"
            style={category.color ? { color: category.color, borderColor: `${category.color}66` } : undefined}
          >
            <Tag size={13} /> Category
          </span>
          <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{category.description}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "insight" : "insights"}
          </p>
        </header>

        <div className="container relative z-10 mt-8">
          <Link
            href="/insights"
            className="group mb-10 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-[#7cc4ff]"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All insights
          </Link>

          {posts.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-14 text-center ring-1 ring-inset ring-white/10">
              <Tag size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
              <h3 className="text-lg font-bold">No insights yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">There are no published insights in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p: any) => (
                <InsightCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
