import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import PreviewBanner from "@/components/public/preview-banner";
import HeroModule from "@/components/modules/hero-module"; // fallback when no homepage is set
import { cmsFetch } from "@/lib/cms-fetch";

// Time-revalidate so a scheduled homepage appears within a minute (mirrors [slug]).
export const revalidate = 60;

async function getHomepage() {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      cmsFetch("/pages/homepage", { next: { tags: ["pages"] } }),
      cmsFetch("/layouts/module-defaults", { next: { tags: ["layouts"] } }),
    ]);

    let page: any = null;
    if (pageRes.ok) {
      const json = await pageRes.json();
      page = json?.data ?? null;
    }

    let moduleDefaults = {};
    if (defaultsRes.ok) {
      const json = await defaultsRes.json();
      moduleDefaults = json?.data ?? {};
    }

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
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function HomePage() {
  const { page, sections, moduleDefaults } = await getHomepage();

  // No page has been designated as the homepage yet — render a minimal hero so
  // the site isn't blank. Set one from Admin → Pages ("Set as homepage").
  if (!page) {
    return (
      <SiteLayout>
        <HeroModule config={(moduleDefaults as any)["HeroSection"] || {}} />
      </SiteLayout>
    );
  }

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
      <PreviewBanner path="/" />
    </SiteLayout>
  );
}
