import React from "react";
import dynamic from "next/dynamic";

function DefaultSection({ type, label, config }: { type: string, label?: string, config?: any }) {
  return (
    <section className="container py-16 border-b">
      <h2 className="text-2xl font-bold tracking-tight mb-4">{label || type}</h2>
      <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center text-muted-foreground">
        <p className="font-mono text-sm">[Placeholder for {type} Component]</p>
        <p className="text-xs mt-2">Configure this module in the admin dashboard.</p>
      </div>
    </section>
  );
}

const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  HeroSection: dynamic(() => import("@/components/modules/hero-module")),
  CTASection: dynamic(() => import("@/components/modules/cta-module")),
  ServicesSection: dynamic(() => import("@/components/modules/services-module")),
  PortfolioSection: dynamic(() => import("@/components/modules/portfolio-module")),
  BlogSection: dynamic(() => import("@/components/modules/blog-module")),
  TestimonialsSection: dynamic(() => import("@/components/modules/testimonials-module")),
  TeamSection: dynamic(() => import("@/components/modules/team-module")),
  FAQSection: dynamic(() => import("@/components/modules/faq-module")),
  StatsSection: dynamic(() => import("@/components/modules/stats-module")),
  AboutSection: dynamic(() => import("@/components/modules/about-module")),
  GalleryModule: dynamic(() => import("@/components/modules/gallery-module")),
  VideoPlayerModule: dynamic(() => import("@/components/modules/video-player-module")),
  SplideSliderModule: dynamic(() => import("@/components/modules/splide-slider-module")),
  SplideLogoTickerModule: dynamic(() => import("@/components/modules/splide-logo-ticker-module")),
  SplideTestimonialsModule: dynamic(() => import("@/components/modules/splide-testimonials-module")),
  SplideGallerySyncModule: dynamic(() => import("@/components/modules/splide-gallery-sync-module")),
  ContactFormModule: dynamic(() => import("@/components/modules/contact-form-module")),
  BookingModule: dynamic(() => import("@/components/modules/booking-module")),
  PricingModule: dynamic(() => import("@/components/modules/pricing-module")),
  LeadMagnetModule: dynamic(() => import("@/components/modules/lead-magnet-module")),
  HorizontalScrollModule: dynamic(() => import("@/components/modules/horizontal-scroll-module")),
  ParallaxBannerModule: dynamic(() => import("@/components/modules/parallax-banner-module")),
  ScrollytellingModule: dynamic(() => import("@/components/modules/scrollytelling-module")),
  TimelineModule: dynamic(() => import("@/components/modules/timeline-module")),
  AnimatedTextHeroModule: dynamic(() => import("@/components/modules/animated-text-hero-module")),
  MarqueeModule: dynamic(() => import("@/components/modules/marquee-module")),
  CounterStatsModule: dynamic(() => import("@/components/modules/counter-stats-module")),
  StaggeredGridModule: dynamic(() => import("@/components/modules/staggered-grid-module")),
};

interface DynamicRendererProps {
  sections: any[];
  moduleDefaults: Record<string, any>;
}

export default function DynamicRenderer({ sections, moduleDefaults }: DynamicRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.filter((s) => s.isVisible).map((section) => {
        // Merge config: Section specific config > Global Module Default > Empty
        const globalDefault = moduleDefaults[section.type] || {};
        let mergedConfig =
          section.config && Object.keys(section.config).length > 0
            ? section.config
            : globalDefault;
        
        let typeToRender = section.type;

        if (typeToRender === 'YouTubeEmbedModule') {
          // Transform old config format to new VideoPlayer format
          mergedConfig = {
            heading: "",
            layout: "single",
            autoplay: mergedConfig.autoplay,
            loop: mergedConfig.loop,
            controls: mergedConfig.controls,
            videos: [{
              videoUrl: mergedConfig.videoUrl,
              posterUrl: "",
              title: ""
            }]
          };
          typeToRender = 'VideoPlayerModule';
        }

        const Component = SECTION_MAP[typeToRender] || DefaultSection;

        return (
          <Component
            key={section.id}
            type={typeToRender}
            label={section.label}
            config={mergedConfig}
          />
        );
      })}
    </>
  );
}
