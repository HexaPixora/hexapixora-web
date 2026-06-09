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
import SiteLayout from "@/components/public/site-layout";

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

async function getHomepageLayout() {
  try {
    const [layoutRes, defaultsRes] = await Promise.all([
      fetch('http://localhost:3001/api/layouts/homepage', { cache: 'no-store' }),
      fetch('http://localhost:3001/api/layouts/module-defaults', { cache: 'no-store' })
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
        {sections.filter((s: any) => s.isVisible).map((section: any) => {
          const Component = SECTION_MAP[section.type] || DefaultSection;
          
          // Merge config: Section specific config > Global Module Default > Empty
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
