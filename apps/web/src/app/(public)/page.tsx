import SiteLayout from "@/components/public/site-layout";
import DynamicRenderer from "@/components/DynamicRenderer";
import HeroModule from "@/components/modules/hero-module"; // Needed for fallback
import { apiUrl } from "@/lib/api-url";

async function getHomepageLayout() {
  try {
    const [layoutRes, defaultsRes] = await Promise.all([
      fetch(apiUrl('/layouts/homepage'), { next: { tags: ['layouts'] } }),
      fetch(apiUrl('/layouts/module-defaults'), { next: { tags: ['layouts'] } })
    ]);
    
    let layoutJson = null;
    let defaultsJson = null;

    if (layoutRes.ok) {
      const text = await layoutRes.text();
      if (text) layoutJson = JSON.parse(text);
    }

    if (defaultsRes.ok) {
      const text = await defaultsRes.text();
      if (text) defaultsJson = JSON.parse(text);
    }
    
    return {
      sections: layoutJson?.data?.sections || [],
      moduleDefaults: defaultsJson?.data || {}
    };
  } catch (err) {
    console.error("Failed to fetch homepage layout:", err);
    return { sections: [], moduleDefaults: {} };
  }
}

export default async function HomePage() {
  const { sections, moduleDefaults } = await getHomepageLayout();

  // Fallback if no sections are returned
  if (!sections || sections.length === 0) {
    return (
      <SiteLayout>
        <HeroModule config={moduleDefaults["HeroSection"] || {}} />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="flex flex-col min-h-screen">
        <DynamicRenderer sections={sections} moduleDefaults={moduleDefaults} />
      </div>
    </SiteLayout>
  );
}
