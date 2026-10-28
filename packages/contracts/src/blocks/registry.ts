
import { ContactFormModuleDef } from "./contact-form";
import { HeroModuleDef } from "./hero";
import { CTASectionDef } from "./cta";
import { ServicesSectionDef } from "./services";
import { PortfolioSectionDef } from "./portfolio";
import { BlogSectionDef } from "./blog";
import { TeamSectionDef } from "./team";
import { FAQSectionDef } from "./faq";
import { StatsSectionDef } from "./stats";
import { AboutSectionDef } from "./about";
import { GalleryModuleDef } from "./gallery";
import { VideoPlayerModuleDef } from "./video-player";
import { SplideSliderModuleDef } from "./slider";
import { SplideLogoTickerModuleDef } from "./logo-ticker";
import { SplideGallerySyncModuleDef } from "./gallery-sync";
import { PricingModuleDef } from "./pricing";
import { LeadMagnetModuleDef } from "./lead-magnet";
import { HorizontalScrollModuleDef } from "./horizontal-scroll";
import { ParallaxBannerModuleDef } from "./parallax-banner";
import { ScrollytellingModuleDef } from "./scrollytelling";
import { TimelineModuleDef } from "./timeline";
import { AnimatedTextHeroModuleDef } from "./animated-text-hero";
import { MarqueeModuleDef } from "./marquee";
import { CounterStatsModuleDef } from "./counter-stats";
import { StaggeredGridModuleDef } from "./staggered-grid";
import { PortfolioHeroModuleDef } from "./portfolio-hero";
import { WhyChooseModuleDef } from "./why-choose";
import { OurStoryModuleDef } from "./our-story";
import { LeaderModuleDef } from "./leader";
import { InstagramReelsModuleDef } from "./instagram-reels";
import { QuoteModuleDef } from "./quote";
import { RichTextModuleDef } from "./rich-text";
import { OurProcessModuleDef } from "./our-process";
import { WorkHeroModuleDef } from "./work-hero";
import { StoryHeroModuleDef } from "./story-hero";
import { TechStackModuleDef } from "./tech-stack";
import { SkillsShowcaseModuleDef } from "./skills-showcase";
import { CustomCodeModuleDef } from "./custom-code";

export type { ModuleFieldType, ModuleField, ModuleDefinition } from "./types";
import type { ModuleDefinition } from "./types";

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
  OurProcessModule: OurProcessModuleDef,
  WorkHeroModule: WorkHeroModuleDef,
  StoryHeroModule: StoryHeroModuleDef,
  TechStackModule: TechStackModuleDef,
  SkillsShowcaseModule: SkillsShowcaseModuleDef,
  LeaderModule: LeaderModuleDef,
  QuoteModule: QuoteModuleDef,
  InstagramReelsModule: InstagramReelsModuleDef,
  RichTextModule: RichTextModuleDef,
  CustomCodeModule: CustomCodeModuleDef,
};

// Builder categories — group modules by purpose so they're easy to find and
// pick. Order here is the display order. Any registered module NOT listed below
// automatically falls into a trailing "Other" group (see groupedModules).
export const MODULE_CATEGORIES: { label: string; modules: string[] }[] = [
  { label: "Hero & Banners", modules: ["HeroSection", "WorkHeroModule", "StoryHeroModule", "AnimatedTextHeroModule", "PortfolioHeroModule", "ParallaxBannerModule"] },
  { label: "Content & Story", modules: ["AboutSection", "OurStoryModule", "OurProcessModule", "WhyChooseModule", "LeaderModule", "QuoteModule", "RichTextModule", "TechStackModule", "TimelineModule", "ScrollytellingModule", "CustomCodeModule"] },
  { label: "Services & Pricing", modules: ["ServicesSection", "PricingModule"] },
  { label: "Portfolio & Galleries", modules: ["PortfolioSection", "GalleryModule", "SplideGallerySyncModule", "SplideSliderModule", "StaggeredGridModule", "HorizontalScrollModule"] },
  { label: "Social Proof", modules: ["TeamSection", "SkillsShowcaseModule", "SplideLogoTickerModule", "MarqueeModule", "StatsSection", "CounterStatsModule"] },
  { label: "Blog & Media", modules: ["BlogSection", "VideoPlayerModule", "InstagramReelsModule"] },
  { label: "Lead Generation", modules: ["CTASection", "ContactFormModule", "LeadMagnetModule", "FAQSection"] },
];

// Default anchor IDs for common single-instance sections, so buttons/nav can
// link to #contact, #faq, etc. out of the box. A section's own config.anchorId
// always wins. Heroes are intentionally omitted (they don't need anchors).
export const DEFAULT_ANCHOR_IDS: Record<string, string> = {
  ContactFormModule: "contact",
  FAQSection: "faq",
  OurStoryModule: "our-story",
  OurProcessModule: "our-process",
  WhyChooseModule: "why-choose",
  SplideLogoTickerModule: "logos",
  AboutSection: "about",
  ServicesSection: "services",
  PricingModule: "pricing",
  TeamSection: "team",
  LeaderModule: "leadership",
  QuoteModule: "quote",
  InstagramReelsModule: "reels",
};

/** Resolve a section's anchor id: its own config.anchorId wins, else a default. */
export function resolveAnchorId(type: string, config: any): string {
  const own = typeof config?.anchorId === "string" ? config.anchorId.trim() : "";
  return own || DEFAULT_ANCHOR_IDS[type] || "";
}

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
