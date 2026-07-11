
import { ContactFormModuleDef } from "./module-schemas/contact-form-schema";
import { HeroModuleDef } from "./module-schemas/hero-schema";
import { ctasectionSchema, CTASectionDef } from "./module-schemas/ctasection-schema";
import { servicesSchema, ServicesSectionDef } from "./module-schemas/services-schema";
import { portfolioSchema, PortfolioSectionDef } from "./module-schemas/portfolio-schema";
import { blogSchema, BlogSectionDef } from "./module-schemas/blog-schema";
import { teamSchema, TeamSectionDef } from "./module-schemas/team-schema";
import { faqsectionSchema, FAQSectionDef } from "./module-schemas/faqsection-schema";
import { statsSchema, StatsSectionDef } from "./module-schemas/stats-schema";
import { aboutSchema, AboutSectionDef } from "./module-schemas/about-schema";
import { gallerySchema, GalleryModuleDef } from "./module-schemas/gallery-schema";
import { videoPlayerSchema, VideoPlayerModuleDef } from "./module-schemas/video-player-schema";
import { splideSliderSchema, SplideSliderModuleDef } from "./module-schemas/splide-slider-schema";
import { splideLogoTickerSchema, SplideLogoTickerModuleDef } from "./module-schemas/splide-logo-ticker-schema";
import { splideGallerySyncSchema, SplideGallerySyncModuleDef } from "./module-schemas/splide-gallery-sync-schema";
import { bookingSchema, BookingModuleDef } from "./module-schemas/booking-schema";
import { pricingSchema, PricingModuleDef } from "./module-schemas/pricing-schema";
import { leadMagnetSchema, LeadMagnetModuleDef } from "./module-schemas/lead-magnet-schema";
import { HorizontalScrollModuleDef } from "./module-schemas/horizontal-scroll-schema";
import { ParallaxBannerModuleDef } from "./module-schemas/parallax-banner-schema";
import { ScrollytellingModuleDef } from "./module-schemas/scrollytelling-schema";
import { TimelineModuleDef } from "./module-schemas/timeline-schema";
import { AnimatedTextHeroModuleDef } from "./module-schemas/animated-text-hero-schema";
import { MarqueeModuleDef } from "./module-schemas/marquee-schema";
import { CounterStatsModuleDef } from "./module-schemas/counter-stats-schema";
import { StaggeredGridModuleDef } from "./module-schemas/staggered-grid-schema";
import { PortfolioHeroModuleDef } from "./module-schemas/portfolio-hero-schema";
import { WhyChooseModuleDef } from "./module-schemas/why-choose-schema";
import { OurStoryModuleDef } from "./module-schemas/our-story-schema";
import { OurProcessModuleDef } from "./module-schemas/our-process-schema";

export type ModuleFieldType = 'text' | 'textarea' | 'image' | 'video' | 'color' | 'boolean' | 'select' | 'richtext' | 'list' | 'categories';

export type ModuleField = {
  name: string;
  label: string;
  type: ModuleFieldType;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: { label: string, value: string }[];
  itemFields?: Omit<ModuleField, 'itemFields'>[];
};

export type ModuleDefinition = {
  type: string;
  label: string;
  description: string;
  fields: ModuleField[];
  defaultConfig: Record<string, any>;
};

export const MODULES: Record<string, ModuleDefinition> = {
  HeroSection: HeroModuleDef,
  CTASection: CTASectionDef,
  ServicesSection: ServicesSectionDef,
  PortfolioSection: PortfolioSectionDef,
  BlogSection: BlogSectionDef,
  TeamSection: TeamSectionDef,
  FAQSection: FAQSectionDef,
  StatsSection: StatsSectionDef,
  AboutSection: AboutSectionDef,
  GalleryModule: GalleryModuleDef,
  VideoPlayerModule: VideoPlayerModuleDef,
  SplideSliderModule: SplideSliderModuleDef,
  SplideLogoTickerModule: SplideLogoTickerModuleDef,
  SplideGallerySyncModule: SplideGallerySyncModuleDef,
  ContactFormModule: ContactFormModuleDef,
  BookingModule: BookingModuleDef,
  PricingModule: PricingModuleDef,
  LeadMagnetModule: LeadMagnetModuleDef,
  HorizontalScrollModule: HorizontalScrollModuleDef,
  ParallaxBannerModule: ParallaxBannerModuleDef,
  ScrollytellingModule: ScrollytellingModuleDef,
  TimelineModule: TimelineModuleDef,
  AnimatedTextHeroModule: AnimatedTextHeroModuleDef,
  MarqueeModule: MarqueeModuleDef,
  CounterStatsModule: CounterStatsModuleDef,
  StaggeredGridModule: StaggeredGridModuleDef,
  PortfolioHeroModule: PortfolioHeroModuleDef,
  WhyChooseModule: WhyChooseModuleDef,
  OurStoryModule: OurStoryModuleDef,
  OurProcessModule: OurProcessModuleDef
};

// Builder categories — group modules by purpose so they're easy to find and
// pick. Order here is the display order. Any registered module NOT listed below
// automatically falls into a trailing "Other" group (see groupedModules).
export const MODULE_CATEGORIES: { label: string; modules: string[] }[] = [
  { label: "Hero & Banners", modules: ["HeroSection", "AnimatedTextHeroModule", "PortfolioHeroModule", "ParallaxBannerModule"] },
  { label: "Content & Story", modules: ["AboutSection", "OurStoryModule", "OurProcessModule", "WhyChooseModule", "TimelineModule", "ScrollytellingModule"] },
  { label: "Services & Pricing", modules: ["ServicesSection", "PricingModule"] },
  { label: "Portfolio & Galleries", modules: ["PortfolioSection", "GalleryModule", "SplideGallerySyncModule", "SplideSliderModule", "StaggeredGridModule", "HorizontalScrollModule"] },
  { label: "Social Proof", modules: ["TeamSection", "SplideLogoTickerModule", "MarqueeModule", "StatsSection", "CounterStatsModule"] },
  { label: "Blog & Media", modules: ["BlogSection", "VideoPlayerModule"] },
  { label: "Lead Generation", modules: ["CTASection", "ContactFormModule", "BookingModule", "LeadMagnetModule", "FAQSection"] },
];

export type ModuleGroup = { label: string; modules: ModuleDefinition[] };

/**
 * Registered modules grouped by category (in MODULE_CATEGORIES order). Only
 * non-empty categories are returned, and any module missing from the category
 * lists is appended under "Other" so nothing is ever hidden.
 */
export function groupedModules(): ModuleGroup[] {
  const assigned = new Set<string>();
  const groups: ModuleGroup[] = MODULE_CATEGORIES.map((cat) => ({
    label: cat.label,
    modules: cat.modules
      .filter((type) => MODULES[type])
      .map((type) => {
        assigned.add(type);
        return MODULES[type]!;
      }),
  })).filter((g) => g.modules.length > 0);

  const other = Object.entries(MODULES)
    .filter(([type]) => !assigned.has(type))
    .map(([, def]) => def);
  if (other.length) groups.push({ label: "Other", modules: other });

  return groups;
}
