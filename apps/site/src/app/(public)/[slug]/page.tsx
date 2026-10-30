import { cache } from "react";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/public/site-layout";
import { PageHeader } from "@hexapixora/theme-hexa-noir/components/page-header";
import { BlockRenderer } from "@hexapixora/theme-hexa-noir/block-renderer";
import { cmsFetch, readJson, readResource } from "@hexapixora/sdk/server";
import { getLatestPosts } from "@/lib/latest-posts";
import { absoluteMediaUrl, siteUrl } from "@/lib/site-url";

// Revalidate periodically (120s) so custom pages serve instantly from cache.
export const revalidate = 120;

// Media-library alt text (filename -> alt). Failure just means module fallbacks.
async function getAltTexts(): Promise<Record<string, string>> {
  const res = await cmsFetch("/media/alt-text", { next: { revalidate: 300 } }).catch(() => null);
  const data = await readJson(res);
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, string>) : {};
}

// Wrapped in React cache() so generateMetadata and the page component share ONE
// execution per request instead of double-fetching.
const getPageData = cache(async (slug: string) => {
  const pageRes = await cmsFetch(`/pages/${slug}`, { next: { revalidate: 120 } }).catch(() => null);

  // The page must exist: a 404 means notFound(), an outage throws (see readResource).
  const pageData = (await readResource(pageRes))?.data;
  if (!pageData) return null;

  let parsedSections: any[] = [];
  try {
    parsedSections = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
  } catch (e) {}

  return {
    page: pageData,
    sections: Array.isArray(parsedSections) ? parsedSections : [],
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
  const canonical = `/${params.slug}`;

  // With its own image, emit a full OG/Twitter block (overrides the layout
  // default). Without one, omit OG so the site-wide default image is inherited.
  if (!ogImage) return { title, description, alternates: { canonical } };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: siteUrl(canonical),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CustomDynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const [data, altTexts] = await Promise.all([getPageData(params.slug), getAltTexts()]);

  if (!data) {
    notFound();
  }

  const { page, sections } = data;

  return (
    <SiteLayout showHeader={page.showHeader} showFooter={page.showFooter} headerOverlay>
      <div className="flex flex-col min-h-screen">
        {sections.length === 0 && <PageHeader title={page.title} intro="This page is currently empty." />}

        <BlockRenderer
          sections={sections}
          altTexts={altTexts}
          latestPosts={await getLatestPosts(sections)}
        />
      </div>
    </SiteLayout>
  );
}
