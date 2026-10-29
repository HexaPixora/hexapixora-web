// Block types as stored in Page.sections today, mapped to the block ids used
// for file names. Phase 4 (Puck) migrates stored data to the ids; until then
// the stored type stays the source of truth.
export const LEGACY_TYPE_TO_ID = {
  AboutSection: "about",
  AnimatedTextHeroModule: "animated-text-hero",
  BlogSection: "blog",
  CTASection: "cta",
  ContactFormModule: "contact-form",
  CounterStatsModule: "counter-stats",
  FAQSection: "faq",
  GalleryModule: "gallery",
  HeroSection: "hero",
  HorizontalScrollModule: "horizontal-scroll",
  LeadMagnetModule: "lead-magnet",
  LeaderModule: "leader",
  MarqueeModule: "marquee",
  OurProcessModule: "our-process",
  OurStoryModule: "our-story",
  ParallaxBannerModule: "parallax-banner",
  PortfolioHeroModule: "portfolio-hero",
  PortfolioSection: "portfolio",
  PricingModule: "pricing",
  QuoteModule: "quote",
  RichTextModule: "rich-text",
  ScrollytellingModule: "scrollytelling",
  ServicesSection: "services",
  SkillsShowcaseModule: "skills-showcase",
  SplideGallerySyncModule: "gallery-sync",
  SplideLogoTickerModule: "logo-ticker",
  SplideSliderModule: "slider",
  StaggeredGridModule: "staggered-grid",
  StatsSection: "stats",
  StoryHeroModule: "story-hero",
  TeamSection: "team",
  TechStackModule: "tech-stack",
  TimelineModule: "timeline",
  WhyChooseModule: "why-choose",
  WorkHeroModule: "work-hero",
} as const;

export type LegacyBlockType = keyof typeof LEGACY_TYPE_TO_ID;
export type BlockId = (typeof LEGACY_TYPE_TO_ID)[LegacyBlockType];
