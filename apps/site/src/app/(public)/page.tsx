import { SiteLayout } from "@/components/public/site-layout";
import { PageHeader } from "@hexapixora/theme-hexa-noir/components/page-header";
import { BlockRenderer } from "@hexapixora/theme-hexa-noir/block-renderer";
import { BLOCKS } from "@hexapixora/contracts/blocks/library";
import { cmsFetch, readJson } from "@hexapixora/sdk/server";
import { getLatestPosts } from "@/lib/latest-posts";
import { absoluteMediaUrl, SITE_URL } from "@/lib/site-url";

// Revalidate periodically (120s) so cached pages serve in ~20ms and Render
// backend cold starts don't block visitors.
export const revalidate = 120;

// Media-library alt text (filename -> alt). Failure just means module fallbacks.
async function getAltTexts(): Promise<Record<string, string>> {
  const res = await cmsFetch("/media/alt-text", { next: { revalidate: 300 } }).catch(() => null);
  const data = await readJson(res);
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, string>) : {};
}

async function getHomepage() {
  try {
    const pageRes = await cmsFetch("/pages/homepage", { next: { revalidate: 120 } });
    const page: any = (await readJson(pageRes))?.data ?? null;

    let sections: any[] = [];
    if (page) {
      try {
        sections = typeof page.sections === "string" ? JSON.parse(page.sections) : page.sections;
      } catch (e) {}
    }

    return { page, sections: Array.isArray(sections) ? sections : [] };
  } catch (err) {
    console.error("Failed to fetch homepage:", err);
    return { page: null, sections: [] };
  }
}

export async function generateMetadata() {
  const { page } = await getHomepage();
  if (!page) return {};
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || undefined;
  const ogImage = page.ogImage ? absoluteMediaUrl(page.ogImage) : undefined;
  // With its own image, emit a full OG/Twitter block (overrides the layout
  // default). Without one, omit OG so the site-wide default image is inherited.
  if (!ogImage) return { title, description, alternates: { canonical: "/" } };
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title,
      description,
      url: SITE_URL,
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

export default async function HomePage() {
  const [{ page, sections }, altTexts] = await Promise.all([getHomepage(), getAltTexts()]);

  // No page has been designated as the homepage yet — render a minimal hero so
  // the site isn't blank. Set one from Admin → Pages ("Set as homepage").
  if (!page) {
    return (
      <SiteLayout headerOverlay>
        <BlockRenderer sections={[{ id: "fallback-hero", type: "hero", isVisible: true, config: BLOCKS.hero.defaultConfig }]} />
      </SiteLayout>
    );
  }

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
