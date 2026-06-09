import { notFound } from "next/navigation";
import SiteLayout from "@/components/public/site-layout";
import HeroModule from "@/components/modules/hero-module";
import CTAModule from "@/components/modules/cta-module";
import ServicesModule from "@/components/modules/services-module";
import PortfolioModule from "@/components/modules/portfolio-module";
import BlogModule from "@/components/modules/blog-module";
import TestimonialsModule from "@/components/modules/testimonials-module";
import TeamModule from "@/components/modules/team-module";
import FAQModule from "@/components/modules/faq-module";
import StatsModule from "@/components/modules/stats-module";
import AboutModule from "@/components/modules/about-module";
import YouTubeModule from "@/components/modules/youtube-module";
import GalleryModule from "@/components/modules/gallery-module";
import VideoPlayerModule from "@/components/modules/video-player-module";
import SplideSliderModule from "@/components/modules/splide-slider-module";
import SplideLogoTickerModule from "@/components/modules/splide-logo-ticker-module";
import SplideTestimonialsModule from "@/components/modules/splide-testimonials-module";
import SplideGallerySyncModule from "@/components/modules/splide-gallery-sync-module";

function DefaultSection({ type, label, config }: { type: string, label: string, config?: any }) {
  return (
    <section className="container py-16 border-b">
      <h2 className="text-2xl font-bold tracking-tight mb-4">{label}</h2>
      <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center text-muted-foreground">
        <p className="font-mono text-sm">[Placeholder for {type} Component]</p>
        <p className="text-xs mt-2">Configure this module in the admin dashboard.</p>
      </div>
    </section>
  );
}

const SECTION_MAP: Record<string, React.FC<any>> = {
  "HeroSection": HeroModule,
  "CTASection": CTAModule,
  "ServicesSection": ServicesModule,
  "PortfolioSection": PortfolioModule,
  "BlogSection": BlogModule,
  "TestimonialsSection": TestimonialsModule,
  "TeamSection": TeamModule,
  "FAQSection": FAQModule,
  "StatsSection": StatsModule,
  "AboutSection": AboutModule,
  "YouTubeEmbedModule": YouTubeModule,
  "GalleryModule": GalleryModule,
  "VideoPlayerModule": VideoPlayerModule,
  "SplideSliderModule": SplideSliderModule,
  "SplideLogoTickerModule": SplideLogoTickerModule,
  "SplideTestimonialsModule": SplideTestimonialsModule,
  "SplideGallerySyncModule": SplideGallerySyncModule,
};

async function getPageData(slug: string) {
  try {
    const [pageRes, defaultsRes] = await Promise.all([
      fetch(`http://localhost:3001/api/pages/${slug}`, { cache: 'no-store' }),
      fetch('http://localhost:3001/api/layouts/module-defaults', { cache: 'no-store' })
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
        
        {sections.filter((s: any) => s.isVisible).map((section: any) => {
          const Component = SECTION_MAP[section.type] || DefaultSection;
          
          const globalDefault = (moduleDefaults as Record<string, any>)[section.type] || {};
          const mergedConfig = section.config && Object.keys(section.config).length > 0 
            ? section.config 
            : globalDefault;
            
          return <Component key={section.id} type={section.type} label={section.label} config={mergedConfig} />;
        })}
      </div>
    </SiteLayout>
  );
}
