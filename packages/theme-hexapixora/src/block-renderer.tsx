import React from "react";
import dynamic from "next/dynamic";
import { resolveAnchorId } from "@hexapixora/contracts/blocks/registry";
import { Reveal } from "@hexapixora/motion/reveal";
import { MediaAltProvider } from "./components/media-alt-provider";

// Skip the global scroll-reveal for: heroes/banners (above the fold — fading
// them delays LCP and looks off) and modules that run their own entrance or
// continuous motion (GSAP counters, Splide tickers, marquee, and the grids that
// stagger their own children below). Everything else gets the reveal.
const NO_REVEAL = new Set([
  // Heroes / banners
  "HeroSection",
  "WorkHeroModule",
  "StoryHeroModule",
  "AnimatedTextHeroModule",
  "PortfolioHeroModule",
  "ParallaxBannerModule",
  // Self-animating / continuous-motion modules
  "CounterStatsModule",
  "ScrollytellingModule",
  "HorizontalScrollModule",
  "MarqueeModule",
  "SplideLogoTickerModule",
  "SplideSliderModule",
  "SplideGallerySyncModule",
  "StaggeredGridModule",
  // Grids with their own Framer stagger (services/why-choose)
  "ServicesSection",
  "WhyChooseModule",
]);

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
  HeroSection: dynamic(() => import("./blocks/hero-block")),
  CTASection: dynamic(() => import("./blocks/cta-block")),
  ServicesSection: dynamic(() => import("./blocks/services-block")),
  PortfolioSection: dynamic(() => import("./blocks/portfolio-block")),
  PortfolioHeroModule: dynamic(() => import("./blocks/portfolio-hero-block")),
  WhyChooseModule: dynamic(() => import("./blocks/why-choose-block")),
  OurStoryModule: dynamic(() => import("./blocks/our-story-block")),
  OurProcessModule: dynamic(() => import("./blocks/our-process-block")),
  WorkHeroModule: dynamic(() => import("./blocks/work-hero-block")),
  StoryHeroModule: dynamic(() => import("./blocks/story-hero-block")),
  TechStackModule: dynamic(() => import("./blocks/tech-stack-block")),
  SkillsShowcaseModule: dynamic(() => import("./blocks/skills-showcase-block")),
  LeaderModule: dynamic(() => import("./blocks/leader-block")),
  QuoteModule: dynamic(() => import("./blocks/quote-block")),
  InstagramReelsModule: dynamic(() => import("./blocks/instagram-reels-block")),
  RichTextModule: dynamic(() => import("./blocks/rich-text-block")),
  BlogSection: dynamic(() => import("./blocks/blog-block")),
  TeamSection: dynamic(() => import("./blocks/team-block")),
  FAQSection: dynamic(() => import("./blocks/faq-block")),
  StatsSection: dynamic(() => import("./blocks/stats-block")),
  AboutSection: dynamic(() => import("./blocks/about-block")),
  GalleryModule: dynamic(() => import("./blocks/gallery-block")),
  VideoPlayerModule: dynamic(() => import("./blocks/video-player-block")),
  SplideSliderModule: dynamic(() => import("./blocks/slider-block")),
  SplideLogoTickerModule: dynamic(() => import("./blocks/logo-ticker-block")),
  SplideGallerySyncModule: dynamic(() => import("./blocks/gallery-sync-block")),
  ContactFormModule: dynamic(() => import("./blocks/contact-form-block")),
  PricingModule: dynamic(() => import("./blocks/pricing-block")),
  LeadMagnetModule: dynamic(() => import("./blocks/lead-magnet-block")),
  HorizontalScrollModule: dynamic(() => import("./blocks/horizontal-scroll-block")),
  ParallaxBannerModule: dynamic(() => import("./blocks/parallax-banner-block")),
  ScrollytellingModule: dynamic(() => import("./blocks/scrollytelling-block")),
  TimelineModule: dynamic(() => import("./blocks/timeline-block")),
  AnimatedTextHeroModule: dynamic(() => import("./blocks/animated-text-hero-block")),
  MarqueeModule: dynamic(() => import("./blocks/marquee-block")),
  CounterStatsModule: dynamic(() => import("./blocks/counter-stats-block")),
  StaggeredGridModule: dynamic(() => import("./blocks/staggered-grid-block")),
  CustomCodeModule: dynamic(() => import("./blocks/custom-code-block")),
};

interface DynamicRendererProps {
  sections: any[];
  moduleDefaults: Record<string, any>;
  // filename -> alt text from the media library (GET /media/alt-text)
  altTexts?: Record<string, string>;
}

export default function DynamicRenderer({ sections, moduleDefaults, altTexts }: DynamicRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Track anchor ids already used on this page so we never emit a duplicate id.
  const usedAnchors = new Set<string>();

  return (
    <MediaAltProvider altTexts={altTexts}>
      {sections.filter((s) => s.isVisible).map((section, index) => {
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

        // Anchor id for in-page links (#contact, #faq, …). First section to
        // claim an id wins; duplicates are dropped to keep the HTML valid.
        const candidate = resolveAnchorId(typeToRender, mergedConfig);
        const anchor = candidate && !usedAnchors.has(candidate) ? candidate : "";
        if (anchor) usedAnchors.add(anchor);

        const rendered = (
          <Component type={typeToRender} label={section.label} config={mergedConfig} />
        );

        // Fade + rise on scroll — except heroes and the first (above-fold) section.
        const content =
          index > 0 && !NO_REVEAL.has(typeToRender) ? <Reveal>{rendered}</Reveal> : rendered;

        return anchor ? (
          <div key={section.id} id={anchor} className="scroll-mt-24">
            {content}
          </div>
        ) : (
          <React.Fragment key={section.id}>{content}</React.Fragment>
        );
      })}
    </MediaAltProvider>
  );
}
