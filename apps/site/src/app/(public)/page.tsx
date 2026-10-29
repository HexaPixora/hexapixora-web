import { SiteLayout } from "@/components/public/site-layout";
import { BlockRenderer } from "@hexapixora/theme-hexa-noir/block-renderer";
import { HeroBlock } from "@hexapixora/theme-hexa-noir/blocks/hero"; // fallback when no homepage is set
import { cmsFetch, readJson } from "@hexapixora/sdk/server";
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
    const [pageRes, defaultsRes] = await Promise.all([
      cmsFetch("/pages/homepage", { next: { revalidate: 120 } }),
      cmsFetch("/layouts/module-defaults", { next: { revalidate: 120 } }),
    ]);

    // readJson never throws on an empty/invalid body (e.g. module-defaults),
    // so a bad sub-response can't blank out the homepage.
    const page: any = (await readJson(pageRes))?.data ?? null;
    const moduleDefaults = (await readJson(defaultsRes))?.data ?? {};

    let sections: any[] = [];
    if (page) {
      try {
        sections = typeof page.sections === "string" ? JSON.parse(page.sections) : page.sections;
      } catch (e) {}
    }

    return { page, sections: Array.isArray(sections) ? sections : [], moduleDefaults };
  } catch (err) {
    console.error("Failed to fetch homepage:", err);
    return { page: null, sections: [], moduleDefaults: {} };
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
  const [{ page, sections, moduleDefaults }, altTexts] = await Promise.all([getHomepage(), getAltTexts()]);

  // No page has been designated as the homepage yet — render a minimal hero so
  // the site isn't blank. Set one from Admin → Pages ("Set as homepage").
  if (!page) {
    return (
      <SiteLayout headerOverlay>
        <HeroBlock config={(moduleDefaults as any)["HeroSection"] || {}} />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout showHeader={page.showHeader} showFooter={page.showFooter} headerOverlay>
      <div className="flex flex-col min-h-screen">
        {sections.length === 0 && (
          <div className="container py-24 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{page.title}</h1>
            <p className="text-muted-foreground text-lg">This page is currently empty.</p>
          </div>
        )}

        <BlockRenderer sections={sections} moduleDefaults={moduleDefaults} altTexts={altTexts} />
      </div>
    </SiteLayout>
  );
}
