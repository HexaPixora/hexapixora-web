
import { ContactFormModuleDef } from "./legacy/contact-form";
import { HeroModuleDef } from "./legacy/hero";
import { CTASectionDef } from "./legacy/cta";
import { ServicesSectionDef } from "./legacy/services";
import { PortfolioSectionDef } from "./legacy/portfolio";
import { BlogSectionDef } from "./legacy/blog";
import { TeamSectionDef } from "./legacy/team";
import { FAQSectionDef } from "./legacy/faq";
import { StatsSectionDef } from "./legacy/stats";
import { AboutSectionDef } from "./legacy/about";
import { GalleryModuleDef } from "./legacy/gallery";
import { SplideSliderModuleDef } from "./legacy/slider";
import { SplideLogoTickerModuleDef } from "./legacy/logo-ticker";
import { SplideGallerySyncModuleDef } from "./legacy/gallery-sync";
import { PricingModuleDef } from "./legacy/pricing";
import { LeadMagnetModuleDef } from "./legacy/lead-magnet";
import { HorizontalScrollModuleDef } from "./legacy/horizontal-scroll";
import { ParallaxBannerModuleDef } from "./legacy/parallax-banner";
import { ScrollytellingModuleDef } from "./legacy/scrollytelling";
import { TimelineModuleDef } from "./legacy/timeline";
import { AnimatedTextHeroModuleDef } from "./legacy/animated-text-hero";
import { MarqueeModuleDef } from "./legacy/marquee";
import { CounterStatsModuleDef } from "./legacy/counter-stats";
import { StaggeredGridModuleDef } from "./legacy/staggered-grid";
import { PortfolioHeroModuleDef } from "./legacy/portfolio-hero";
import { WhyChooseModuleDef } from "./legacy/why-choose";
import { OurStoryModuleDef } from "./legacy/our-story";
import { LeaderModuleDef } from "./legacy/leader";
import { QuoteModuleDef } from "./legacy/quote";
import { RichTextModuleDef } from "./legacy/rich-text";
import { OurProcessModuleDef } from "./legacy/our-process";
import { WorkHeroModuleDef } from "./legacy/work-hero";
import { StoryHeroModuleDef } from "./legacy/story-hero";
import { TechStackModuleDef } from "./legacy/tech-stack";
import { SkillsShowcaseModuleDef } from "./legacy/skills-showcase";
import { FilmHeroDef } from "./legacy/film-hero";
import { StatementDef } from "./legacy/statement";
import { CrewDef } from "./legacy/crew";
import { PillarsDef } from "./legacy/pillars";
import { CaseFilesDef } from "./legacy/case-files";
import { LabDef } from "./legacy/lab";
import { ProcessStepsDef } from "./legacy/process-steps";
import { FaqListDef } from "./legacy/faq-list";
import { ClosingCtaDef } from "./legacy/closing-cta";

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
  RichTextModule: RichTextModuleDef,
  // Cinematic section blocks (Phase 3). Stored under their block id; any
  // theme pack restyles them through tokens and variants.
  "film-hero": FilmHeroDef,
  statement: StatementDef,
  crew: CrewDef,
  pillars: PillarsDef,
  "case-files": CaseFilesDef,
  lab: LabDef,
  "process-steps": ProcessStepsDef,
  "faq-list": FaqListDef,
  "closing-cta": ClosingCtaDef,
};

// Builder categories — group modules by purpose so they're easy to find and
// pick. Order here is the display order. Any registered module NOT listed below
// automatically falls into a trailing "Other" group (see groupedModules).
export const MODULE_CATEGORIES: { label: string; modules: string[] }[] = [
  { label: "Cinematic sections", modules: ["film-hero", "statement", "crew", "pillars", "case-files", "lab", "process-steps", "faq-list", "closing-cta"] },
  { label: "Hero & Banners", modules: ["HeroSection", "WorkHeroModule", "StoryHeroModule", "AnimatedTextHeroModule", "PortfolioHeroModule", "ParallaxBannerModule"] },
  { label: "Content & Story", modules: ["AboutSection", "OurStoryModule", "OurProcessModule", "WhyChooseModule", "LeaderModule", "QuoteModule", "RichTextModule", "TechStackModule", "TimelineModule", "ScrollytellingModule"] },
  { label: "Services & Pricing", modules: ["ServicesSection", "PricingModule"] },
  { label: "Portfolio & Galleries", modules: ["PortfolioSection", "GalleryModule", "SplideGallerySyncModule", "SplideSliderModule", "StaggeredGridModule", "HorizontalScrollModule"] },
  { label: "Social Proof", modules: ["TeamSection", "SkillsShowcaseModule", "SplideLogoTickerModule", "MarqueeModule", "StatsSection", "CounterStatsModule"] },
  { label: "Blog", modules: ["BlogSection"] },
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
  "faq-list": "faq",
  "process-steps": "process",
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
