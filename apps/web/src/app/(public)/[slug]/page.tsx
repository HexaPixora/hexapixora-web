import { notFound } from "next/navigation";
import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";

async function getPageData(slug: string) {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      fetch(`http://localhost:3001/api/pages/${slug}`, { next: { tags: ['pages'] } }),
      fetch('http://localhost:3001/api/layouts/module-defaults', { next: { tags: ['layouts'] } })
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
    </SiteLayout>
  );
}
