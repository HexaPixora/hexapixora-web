import React from "react";
import dynamic from "next/dynamic";
import { resolveAnchorId } from "@hexapixora/contracts/blocks/registry";
import { Reveal } from "@hexapixora/motion/reveal";
import { NOIR_BLOCKS } from "./block-map";
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
  // Restyled blocks that run their own entrance motion.
  "CTASection",
  "LeadMagnetModule",
  "AboutSection",
  "OurStoryModule",
  "OurProcessModule",
  "TechStackModule",
  "TimelineModule",
  "RichTextModule",
  "LeaderModule",
  "QuoteModule",
  "SkillsShowcaseModule",
  "FAQSection",
  "StatsSection",
  "PortfolioSection",
  "BlogSection",
  "TeamSection",
  "GalleryModule",
  "VideoPlayerModule",
  "InstagramReelsModule",
  "PricingModule",
  "ContactFormModule",
  "CustomCodeModule",
  // Cinematic blocks run their own entrance motion.
  ...Object.keys(NOIR_BLOCKS),
]);

/**
 * A stored block type this theme has no component for. Visitors see nothing
 * (an empty box would be thin content); developers get a note.
 */
function DefaultSection({ type, label }: { type: string; label?: string; config?: unknown; posts?: unknown[] }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <section data-block="unknown" className="border-t border-line py-16">
      <div className="page-width">
        <p className="mono border border-dashed border-line p-8 text-copy-dim">
          No component for <span className="text-signal">{type}</span>
          {label && label !== type ? ` (${label})` : ""}
        </p>
      </div>
    </section>
  );
}

const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  HeroSection: dynamic(() => import("./blocks/hero/hero-block").then((m) => m.HeroBlock)),
  CTASection: dynamic(() => import("./blocks/cta/cta-block").then((m) => m.CtaBlock)),
  ServicesSection: dynamic(() => import("./blocks/services/services-block").then((m) => m.ServicesBlock)),
  PortfolioSection: dynamic(() => import("./blocks/portfolio/portfolio-block").then((m) => m.PortfolioBlock)),
  PortfolioHeroModule: dynamic(() => import("./blocks/portfolio-hero/portfolio-hero-block").then((m) => m.PortfolioHeroBlock)),
  WhyChooseModule: dynamic(() => import("./blocks/why-choose/why-choose-block").then((m) => m.WhyChooseBlock)),
  OurStoryModule: dynamic(() => import("./blocks/our-story/our-story-block").then((m) => m.OurStoryBlock)),
  OurProcessModule: dynamic(() => import("./blocks/our-process/our-process-block").then((m) => m.OurProcessBlock)),
  WorkHeroModule: dynamic(() => import("./blocks/work-hero/work-hero-block").then((m) => m.WorkHeroBlock)),
  StoryHeroModule: dynamic(() => import("./blocks/story-hero/story-hero-block").then((m) => m.StoryHeroBlock)),
  TechStackModule: dynamic(() => import("./blocks/tech-stack/tech-stack-block").then((m) => m.TechStackBlock)),
  SkillsShowcaseModule: dynamic(() => import("./blocks/skills-showcase/skills-showcase-block").then((m) => m.SkillsShowcaseBlock)),
  LeaderModule: dynamic(() => import("./blocks/leader/leader-block").then((m) => m.LeaderBlock)),
  QuoteModule: dynamic(() => import("./blocks/quote/quote-block").then((m) => m.QuoteBlock)),
  InstagramReelsModule: dynamic(() => import("./blocks/instagram-reels/instagram-reels-block").then((m) => m.InstagramReelsBlock)),
  RichTextModule: dynamic(() => import("./blocks/rich-text/rich-text-block").then((m) => m.RichTextBlock)),
  BlogSection: dynamic(() => import("./blocks/blog/blog-block").then((m) => m.BlogBlock)),
  TeamSection: dynamic(() => import("./blocks/team/team-block").then((m) => m.TeamBlock)),
  FAQSection: dynamic(() => import("./blocks/faq/faq-block").then((m) => m.FaqBlock)),
  StatsSection: dynamic(() => import("./blocks/stats/stats-block").then((m) => m.StatsBlock)),
  AboutSection: dynamic(() => import("./blocks/about/about-block").then((m) => m.AboutBlock)),
  GalleryModule: dynamic(() => import("./blocks/gallery/gallery-block").then((m) => m.GalleryBlock)),
  VideoPlayerModule: dynamic(() => import("./blocks/video-player/video-player-block").then((m) => m.VideoPlayerBlock)),
  SplideSliderModule: dynamic(() => import("./blocks/slider/slider-block").then((m) => m.SliderBlock)),
  SplideLogoTickerModule: dynamic(() => import("./blocks/logo-ticker/logo-ticker-block").then((m) => m.LogoTickerBlock)),
  SplideGallerySyncModule: dynamic(() => import("./blocks/gallery-sync/gallery-sync-block").then((m) => m.GallerySyncBlock)),
  ContactFormModule: dynamic(() => import("./blocks/contact-form/contact-form-block").then((m) => m.ContactFormBlock)),
  PricingModule: dynamic(() => import("./blocks/pricing/pricing-block").then((m) => m.PricingBlock)),
  LeadMagnetModule: dynamic(() => import("./blocks/lead-magnet/lead-magnet-block").then((m) => m.LeadMagnetBlock)),
  HorizontalScrollModule: dynamic(() => import("./blocks/horizontal-scroll/horizontal-scroll-block").then((m) => m.HorizontalScrollBlock)),
  ParallaxBannerModule: dynamic(() => import("./blocks/parallax-banner/parallax-banner-block").then((m) => m.ParallaxBannerBlock)),
  ScrollytellingModule: dynamic(() => import("./blocks/scrollytelling/scrollytelling-block").then((m) => m.ScrollytellingBlock)),
  TimelineModule: dynamic(() => import("./blocks/timeline/timeline-block").then((m) => m.TimelineBlock)),
  AnimatedTextHeroModule: dynamic(() => import("./blocks/animated-text-hero/animated-text-hero-block").then((m) => m.AnimatedTextHeroBlock)),
  MarqueeModule: dynamic(() => import("./blocks/marquee/marquee-block").then((m) => m.MarqueeBlock)),
  CounterStatsModule: dynamic(() => import("./blocks/counter-stats/counter-stats-block").then((m) => m.CounterStatsBlock)),
  StaggeredGridModule: dynamic(() => import("./blocks/staggered-grid/staggered-grid-block").then((m) => m.StaggeredGridBlock)),
  CustomCodeModule: dynamic(() => import("./blocks/custom-code/custom-code-block").then((m) => m.CustomCodeBlock)),
  ...NOIR_BLOCKS,
};

interface BlockRendererProps {
  sections: any[];
  moduleDefaults: Record<string, any>;
  // filename -> alt text from the media library (GET /media/alt-text)
  altTexts?: Record<string, string>;
  /** Latest published posts, loaded by the app when a page has a blog block. */
  latestPosts?: unknown[];
}

export function BlockRenderer({ sections, moduleDefaults, altTexts, latestPosts }: BlockRendererProps) {
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
          <Component type={typeToRender} label={section.label} config={mergedConfig} posts={latestPosts} />
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
