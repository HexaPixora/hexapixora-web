import { notFound } from "next/navigation";
import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import PreviewBanner from "@/components/public/preview-banner";
import { cmsFetch, isPreview } from "@/lib/cms-fetch";
import { apiUrl } from "@/lib/api-url";

// Render live on every request so admin edits (and scheduled publishes) appear
// immediately, instead of relying on Vercel edge-cache invalidation that proved
// unreliable for prerendered routes.
export const dynamic = "force-dynamic";
// Belt-and-suspenders: force EVERY fetch in this route to bypass the Next data
// cache, so a stale cached result for a slug can never be served.
export const fetchCache = "force-no-store";

async function getPageData(slug: string) {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      cmsFetch(`/pages/${slug}`, { cache: "no-store" }),
      cmsFetch('/layouts/module-defaults', { cache: "no-store" })
    ]);
    
    if (!pageRes.ok) return null;
    
    const pageJson = await pageRes.json();
    let defaultsJson = { data: {} };
    if (defaultsRes.ok) {
      defaultsJson = await defaultsRes.json();
    }
    
    const pageData = pageJson.data;
    if (!pageData) return null;
    
    let parsedSections = [];
    try {
      parsedSections = typeof pageData.sections === 'string' ? JSON.parse(pageData.sections) : pageData.sections;
    } catch(e) {}

    return {
      page: pageData,
      sections: Array.isArray(parsedSections) ? parsedSections : [],
      moduleDefaults: defaultsJson?.data || {}
    };
  } catch (err) {
    console.error("Failed to fetch custom page:", err);
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);
  if (!data || !data.page) return {};
  
  return {
    title: data.page.metaTitle || data.page.title,
    description: data.page.metaDescription,
  };
}

export default async function CustomDynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getPageData(params.slug);

  if (!data) {
    // TEMP DIAG — compare raw fetch vs cmsFetch in THIS page context.
    const preview = await isPreview();
    let raw: any, viaCms: any;
    try { const r = await fetch(apiUrl(`/pages/${params.slug}`), { cache: "no-store" }); raw = { status: r.status, ok: r.ok }; } catch (e: any) { raw = { threw: String(e?.message ?? e) }; }
    try { const r = await cmsFetch(`/pages/${params.slug}`, { cache: "no-store" }); const t = await r.text(); viaCms = { status: r.status, ok: r.ok, bodyStart: t.slice(0, 100) }; } catch (e: any) { viaCms = { threw: String(e?.message ?? e) }; }
    return <pre style={{ padding: 24, whiteSpace: "pre-wrap" }}>{JSON.stringify({ slug: params.slug, preview, raw, viaCms }, null, 2)}</pre>;
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
