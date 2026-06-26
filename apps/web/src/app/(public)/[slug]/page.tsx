import { cache } from "react";
import { notFound } from "next/navigation";
import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import PreviewBanner from "@/components/public/preview-banner";
import { cmsFetch, readJson } from "@/lib/cms-fetch";
import { absoluteMediaUrl } from "@/lib/site-url";

// Render live on every request so admin edits (and scheduled publishes) appear
// immediately, instead of relying on Vercel edge-cache invalidation that proved
// unreliable for prerendered routes.
export const dynamic = "force-dynamic";

// Wrapped in React cache() so generateMetadata and the page component share ONE
// execution per request instead of double-fetching.
const getPageData = cache(async (slug: string) => {
  const [pageRes, defaultsRes] = await Promise.all([
    cmsFetch(`/pages/${slug}`, { cache: "no-store" }).catch(() => null),
    cmsFetch("/layouts/module-defaults", { cache: "no-store" }).catch(() => null),
  ]);

  // readJson never throws — an empty/invalid sub-response (e.g. module-defaults)
  // must not take down the whole page.
  const pageData = (await readJson(pageRes))?.data;
  if (!pageData) return null;

  let parsedSections: any[] = [];
  try {
    parsedSections = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
  } catch (e) {}

  return {
    page: pageData,
    sections: Array.isArray(parsedSections) ? parsedSections : [],
    moduleDefaults: (await readJson(defaultsRes))?.data || {},
  };
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);
  if (!data || !data.page) return {};

  const page = data.page;
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || undefined;
  // OG/Twitter images must be absolute; absoluteMediaUrl passes Supabase URLs
  // through and prefixes any legacy app-relative ones.
  const ogImage = page.ogImage ? absoluteMediaUrl(page.ogImage) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CustomDynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { page, sections, moduleDefaults } = data;

  return (
    <SiteLayout showHeader={page.showHeader} showFooter={page.showFooter}>
      <div className="flex flex-col min-h-screen">
        {sections.length === 0 && (
          <div className="container py-24 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{page.title}</h1>
            <p className="text-muted-foreground text-lg">This page is currently empty.</p>
          </div>
        )}
        
        <DynamicRenderer sections={sections} moduleDefaults={moduleDefaults} />
      </div>
      <PreviewBanner path={`/${page.slug}`} />
    </SiteLayout>
  );
}
