import { cache } from "react";
import { notFound } from "next/navigation";
import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import PreviewBanner from "@/components/public/preview-banner";
import { cmsFetch } from "@/lib/cms-fetch";

// Render live on every request so admin edits (and scheduled publishes) appear
// immediately, instead of relying on Vercel edge-cache invalidation that proved
// unreliable for prerendered routes.
export const dynamic = "force-dynamic";
// Belt-and-suspenders: force EVERY fetch in this route to bypass the Next data
// cache, so a stale cached result for a slug can never be served.
export const fetchCache = "force-no-store";

// Wrapped in React cache() so generateMetadata and the page component share ONE
// execution per request. Without this, the two invocations race through Next's
// fetch request-memoization and the component can reuse an aborted/poisoned
// in-flight fetch from generateMetadata — which returned null and 404'd valid pages.
const getPageData = cache(async (slug: string): Promise<any> => {
  const dbg: any = { slug };
  try {
    const pageRes = await cmsFetch(`/pages/${slug}`, { cache: "no-store" });
    dbg.pageStatus = pageRes.status;
    dbg.pageOk = pageRes.ok;
    if (!pageRes.ok) return { __dbg: { ...dbg, reason: "pageRes not ok" } };

    const pageJson = await pageRes.json();
    dbg.hasData = Boolean(pageJson?.data);
    const pageData = pageJson.data;
    if (!pageData) return { __dbg: { ...dbg, reason: "pageJson.data null", keys: Object.keys(pageJson || {}) } };

    const defaultsRes = await cmsFetch('/layouts/module-defaults', { cache: "no-store" });
    let defaultsJson: any = { data: {} };
    if (defaultsRes.ok) defaultsJson = await defaultsRes.json();

    let parsedSections: any = [];
    try {
      parsedSections = typeof pageData.sections === 'string' ? JSON.parse(pageData.sections) : pageData.sections;
    } catch (e) {}

    return {
      page: pageData,
      sections: Array.isArray(parsedSections) ? parsedSections : [],
      moduleDefaults: defaultsJson?.data || {},
    };
  } catch (err: any) {
    return { __dbg: { ...dbg, reason: "threw", err: String(err?.message ?? err) } };
  }
});

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);
  if (!data || data.__dbg || !data.page) return {};

  return {
    title: data.page.metaTitle || data.page.title,
    description: data.page.metaDescription,
  };
}

export default async function CustomDynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);

  if (!data || data.__dbg) {
    // TEMP DIAG — surface getPageData's actual failure reason.
    return <pre style={{ padding: 24, whiteSpace: "pre-wrap" }}>{JSON.stringify(data?.__dbg ?? { reason: "data was null" }, null, 2)}</pre>;
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
