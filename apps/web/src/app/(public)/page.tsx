import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import PreviewBanner from "@/components/public/preview-banner";
import HeroModule from "@/components/modules/hero-module"; // fallback when no homepage is set
import { cmsFetch, readJson } from "@/lib/cms-fetch";

// Render live on every request so admin edits (and scheduled publishes) appear
// immediately. On-demand tag revalidation proved unreliable on Vercel's edge for
// prerendered routes, so we render dynamically like the blog/category routes.
export const dynamic = "force-dynamic";

async function getHomepage() {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      cmsFetch("/pages/homepage", { cache: "no-store" }),
      cmsFetch("/layouts/module-defaults", { cache: "no-store" }),
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
