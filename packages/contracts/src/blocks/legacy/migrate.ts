import type { z } from "zod";
import { BLOCK_SCHEMAS, isBlockId, type BlockId } from "../library";
import { aboutSchema } from "./about";
import { animatedTextHeroSchema } from "./animated-text-hero";
import { blogSchema } from "./blog";
import { caseFilesSchema } from "./case-files";
import { closingCtaSchema } from "./closing-cta";
import { contactFormSchema } from "./contact-form";
import { counterStatsSchema } from "./counter-stats";
import { crewSchema } from "./crew";
import { ctasectionSchema } from "./cta";
import { faqListSchema } from "./faq-list";
import { faqsectionSchema } from "./faq";
import { filmHeroSchema } from "./film-hero";
import { splideGallerySyncSchema } from "./gallery-sync";
import { gallerySchema } from "./gallery";
import { heroSchema } from "./hero";
import { horizontalScrollSchema } from "./horizontal-scroll";
import { labSchema } from "./lab";
import { leadMagnetSchema } from "./lead-magnet";
import { leaderSchema } from "./leader";
import { splideLogoTickerSchema } from "./logo-ticker";
import { marqueeSchema } from "./marquee";
import { ourProcessSchema } from "./our-process";
import { ourStorySchema } from "./our-story";
import { parallaxBannerSchema } from "./parallax-banner";
import { pillarsSchema } from "./pillars";
import { portfolioHeroSchema } from "./portfolio-hero";
import { portfolioSchema } from "./portfolio";
import { pricingSchema } from "./pricing";
import { processStepsSchema } from "./process-steps";
import { quoteSchema } from "./quote";
import { richTextSchema } from "./rich-text";
import { scrollytellingSchema } from "./scrollytelling";
import { servicesSchema } from "./services";
import { skillsShowcaseSchema } from "./skills-showcase";
import { splideSliderSchema } from "./slider";
import { staggeredGridSchema } from "./staggered-grid";
import { statementSchema } from "./statement";
import { statsSchema } from "./stats";
import { storyHeroSchema } from "./story-hero";
import { teamSchema } from "./team";
import { techStackSchema } from "./tech-stack";
import { timelineSchema } from "./timeline";
import { whyChooseSchema } from "./why-choose";
import { workHeroSchema } from "./work-hero";

// Moves sections saved with the old one-page blocks to the block library
// (plans/phase-3c). Used by the site at render time and by the workspace
// migration script, so stored data and live pages always agree. Removed in
// Phase 4 once production has moved.

export type Section = {
  id: string;
  type: string;
  label?: string;
  isVisible?: boolean;
  config?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type Config = Record<string, unknown>;
type Converted = { type: BlockId; config: Config };

/** Anchors the old blocks got from their type; kept so links like /about-us#our-story still work. */
const LEGACY_ANCHORS: Record<string, string> = {
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
};

/** Old blocks that were removed outright (2026-10-30); their sections are dropped. */
const REMOVED = new Set(["CustomCodeModule", "InstagramReelsModule", "VideoPlayerModule", "YouTubeEmbedModule"]);

const lines = (...parts: string[]) => parts.filter((part) => part.trim()).join("\n");
const action = (label: string, url: string, style: "primary" | "secondary" = "primary") =>
  label.trim() && url.trim() ? [{ label, url, style }] : [];
const step = (i: number) => String(i + 1).padStart(2, "0");

/** The old cinematic blocks' chapter row. */
const chapter = (c: { chapter: string; heading: string; aside: string; anchorId: string }) => ({
  headStyle: "chapter",
  number: c.chapter,
  heading: c.heading,
  aside: c.aside,
  anchorId: c.anchorId,
});

const CONVERTERS: Record<string, { schema: z.ZodType<Config>; to: (c: any) => Converted }> = {
  // Heroes
  "film-hero": {
    schema: filmHeroSchema,
    to: (c: z.infer<typeof filmHeroSchema>) => ({
      type: "hero",
      config: {
        layout: "film",
        backdrop: c.variant,
        heading: lines(c.titleTop, c.titleBottom),
        intro: c.subline,
        actions: action(c.ctaText, c.ctaUrl),
        note: c.scrollHint,
      },
    }),
  },
  HeroSection: {
    schema: heroSchema,
    to: (c: z.infer<typeof heroSchema>) => ({
      type: "hero",
      config: {
        layout: c.backgroundImage ? "image" : "type",
        motion: "none",
        image: c.backgroundImage,
        heading: c.heading,
        intro: c.subheading,
        actions: [
          ...action(c.buttonText, c.buttonUrl),
          ...action(c.secondaryButtonText, c.secondaryButtonUrl, "secondary"),
        ],
      },
    }),
  },
  ParallaxBannerModule: {
    schema: parallaxBannerSchema,
    to: (c: z.infer<typeof parallaxBannerSchema>) => ({
      type: "hero",
      config: {
        layout: "image",
        image: c.image,
        heading: c.heading,
        intro: c.subheading,
        actions: action(c.buttonText, c.buttonLink),
        motion: ["subtle", "medium", "strong"].includes(c.intensity) ? c.intensity : "medium",
        overlay: ["none", "light", "medium", "dark"].includes(c.overlay) ? c.overlay : "medium",
      },
    }),
  },
  StoryHeroModule: {
    schema: storyHeroSchema,
    to: (c: z.infer<typeof storyHeroSchema>) => ({
      type: "hero",
      config: {
        layout: "split",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.intro,
        note: c.foundedLabel,
        image: c.image,
      },
    }),
  },
  WorkHeroModule: {
    schema: workHeroSchema,
    to: (c: z.infer<typeof workHeroSchema>) => ({
      type: "hero",
      config: {
        layout: "stats",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        actions: action(c.buttonText, c.buttonUrl),
        stats: c.stats,
      },
    }),
  },
  AnimatedTextHeroModule: {
    schema: animatedTextHeroSchema,
    to: (c: z.infer<typeof animatedTextHeroSchema>) => ({
      type: "hero",
      config: {
        layout: "type",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        actions: action(c.buttonText, c.buttonLink),
      },
    }),
  },
  PortfolioHeroModule: {
    schema: portfolioHeroSchema,
    to: (c: z.infer<typeof portfolioHeroSchema>) => ({
      type: "hero",
      config: {
        layout: "profile",
        label: c.title,
        heading: c.name,
        intro: c.bio,
        image: c.image,
        note: c.availability,
        tags: c.skills.filter((skill) => skill.label),
        stats: c.stats,
        actions: c.ctas.flatMap((cta) => action(cta.label, cta.url, cta.style === "primary" ? "primary" : "secondary")),
      },
    }),
  },

  // Text and quotes
  statement: {
    schema: statementSchema,
    to: (c: z.infer<typeof statementSchema>) => ({
      type: "text",
      config: { layout: "statement", ...chapter(c), text: c.text },
    }),
  },
  RichTextModule: {
    schema: richTextSchema,
    to: (c: z.infer<typeof richTextSchema>) => ({
      type: "text",
      config: { layout: "prose", heading: c.heading, content: c.content, note: c.lastUpdated },
    }),
  },
  AboutSection: {
    schema: aboutSchema,
    to: (c: z.infer<typeof aboutSchema>) => ({
      type: "text",
      config: {
        layout: "split",
        label: c.eyebrow,
        heading: c.heading,
        text: c.content,
        image: c.image,
        items: c.highlights.map((item) => ({ title: item.title, text: item.description })),
        actions: action(c.buttonText, c.buttonUrl),
      },
    }),
  },
  QuoteModule: {
    schema: quoteSchema,
    to: (c: z.infer<typeof quoteSchema>) => ({
      type: "quote",
      config: { layout: "pull", label: c.eyebrow, quote: c.quote, image: c.avatar, name: c.name, role: c.title },
    }),
  },
  LeaderModule: {
    schema: leaderSchema,
    to: (c: z.infer<typeof leaderSchema>) => ({
      type: "quote",
      config: {
        layout: "letter",
        label: c.kicker,
        quote: c.quote,
        text: c.letter,
        image: c.portrait,
        imageCaption: c.portraitCaption,
        signature: c.signature,
        name: c.name,
        role: c.title,
        stats: c.stats,
      },
    }),
  },

  // Cards
  ServicesSection: {
    schema: servicesSchema,
    to: (c: z.infer<typeof servicesSchema>) => ({
      type: "cards",
      config: {
        layout: "grid",
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((item) => ({
          title: item.title,
          text: item.description,
          icon: item.icon,
          url: item.link,
          linkText: item.buttonText,
        })),
      },
    }),
  },
  WhyChooseModule: {
    schema: whyChooseSchema,
    to: (c: z.infer<typeof whyChooseSchema>) => ({
      type: "cards",
      config: {
        layout: "icons",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((item) => ({ icon: item.icon, title: item.title, text: item.description })),
      },
    }),
  },
  pillars: {
    schema: pillarsSchema,
    to: (c: z.infer<typeof pillarsSchema>) => ({
      type: "cards",
      config: {
        layout: "pillars",
        ...chapter(c),
        items: c.items.map((item) => ({ label: item.label, title: item.title, text: item.text, tags: item.services })),
      },
    }),
  },
  TechStackModule: {
    schema: techStackSchema,
    to: (c: z.infer<typeof techStackSchema>) => ({
      type: "cards",
      config: {
        layout: "logos",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        items: c.technologies.map((tech) => ({ title: tech.name, icon: tech.icon, label: tech.category })),
      },
    }),
  },
  SkillsShowcaseModule: {
    schema: skillsShowcaseSchema,
    to: (c: z.infer<typeof skillsShowcaseSchema>) => ({
      type: "cards",
      config: {
        layout: "meters",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        items: c.skills.map((skill) => ({ title: skill.name, value: skill.level })),
      },
    }),
  },

  // Steps
  OurProcessModule: {
    schema: ourProcessSchema,
    to: (c: z.infer<typeof ourProcessSchema>) => ({
      type: "steps",
      config: {
        layout: "row",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        items: c.steps.map((s, i) => ({ label: `Step ${step(i)}`, title: s.title, text: s.description })),
      },
    }),
  },
  "process-steps": {
    schema: processStepsSchema,
    to: (c: z.infer<typeof processStepsSchema>) => ({
      type: "steps",
      config: { layout: "row", ...chapter(c), items: c.steps, note: c.promise },
    }),
  },
  OurStoryModule: {
    schema: ourStorySchema,
    to: (c: z.infer<typeof ourStorySchema>) => ({
      type: "steps",
      config: {
        layout: "milestones",
        label: c.eyebrow,
        heading: c.heading,
        intro: c.subheading,
        items: c.milestones.map((m) => ({ label: m.year, title: m.title, text: m.description })),
      },
    }),
  },
  TimelineModule: {
    schema: timelineSchema,
    to: (c: z.infer<typeof timelineSchema>) => ({
      type: "steps",
      config: {
        layout: "timeline",
        heading: c.heading,
        intro: c.subheading,
        image: c.backgroundImage,
        overlay: c.overlay,
        items: c.steps.map((s) => ({ label: s.date, title: s.title, text: s.text })),
      },
    }),
  },
  ScrollytellingModule: {
    schema: scrollytellingSchema,
    to: (c: z.infer<typeof scrollytellingSchema>) => ({
      type: "steps",
      config: { layout: "story", heading: c.heading, items: c.steps.map((s) => ({ ...s, label: "" })) },
    }),
  },

  // Numbers and people
  StatsSection: {
    schema: statsSchema,
    to: (c: z.infer<typeof statsSchema>) => ({
      type: "stats",
      config: {
        layout: "row",
        heading: c.heading,
        intro: c.subheading,
        items: [
          [c.stat1Value, c.stat1Label],
          [c.stat2Value, c.stat2Label],
          [c.stat3Value, c.stat3Label],
          [c.stat4Value, c.stat4Label],
        ]
          .filter(([value]) => value)
          .map(([value, label]) => ({ value, suffix: "", label })),
      },
    }),
  },
  CounterStatsModule: {
    schema: counterStatsSchema,
    to: (c: z.infer<typeof counterStatsSchema>) => ({
      type: "stats",
      config: { layout: "counters", heading: c.heading, intro: c.subheading, items: c.stats },
    }),
  },
  TeamSection: {
    schema: teamSchema,
    to: (c: z.infer<typeof teamSchema>) => ({
      type: "people",
      config: {
        layout: "photos",
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((p) => ({ title: p.name, label: p.role, image: p.image, url: p.linkedin })),
      },
    }),
  },
  crew: {
    schema: crewSchema,
    to: (c: z.infer<typeof crewSchema>) => ({
      type: "people",
      config: {
        layout: "roles",
        ...chapter(c),
        items: c.items.map((p) => ({ title: p.role, label: p.availability, text: p.description, lead: p.lead })),
        note: c.note,
      },
    }),
  },

  // Work, products and media
  PortfolioSection: {
    schema: portfolioSchema,
    to: (c: z.infer<typeof portfolioSchema>) => ({
      type: "work",
      config: {
        layout: "grid",
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((item) => ({
          title: item.title,
          image: item.image,
          tags: (item.categories.length ? item.categories : item.category ? [item.category] : []).join("\n"),
        })),
      },
    }),
  },
  "case-files": {
    schema: caseFilesSchema,
    to: (c: z.infer<typeof caseFilesSchema>) => ({
      type: "work",
      config: {
        layout: "dossier",
        ...chapter(c),
        finish: c.variant,
        stats: c.counters,
        note: c.note,
        items: c.files.map(({ stamp, ...file }) => ({ ...file, label: stamp })),
      },
    }),
  },
  StaggeredGridModule: {
    schema: staggeredGridSchema,
    to: (c: z.infer<typeof staggeredGridSchema>) => ({
      type: "work",
      config: {
        layout: "staggered",
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((item) => ({ image: item.image, title: item.title, text: item.text, url: item.link })),
      },
    }),
  },
  HorizontalScrollModule: {
    schema: horizontalScrollSchema,
    to: (c: z.infer<typeof horizontalScrollSchema>) => ({
      type: "work",
      config: {
        layout: "scroll",
        heading: c.heading,
        intro: c.subheading,
        ratio: c.aspectRatio,
        items: c.items.map((item) => ({ image: item.image, title: item.title, text: item.subtitle, url: item.link })),
      },
    }),
  },
  lab: {
    schema: labSchema,
    to: (c: z.infer<typeof labSchema>) => ({
      type: "products",
      config: {
        layout: "cards",
        ...chapter(c),
        items: c.items.map(({ kind, linkUrl, ...item }) => ({ ...item, label: kind, url: linkUrl })),
      },
    }),
  },
  GalleryModule: {
    schema: gallerySchema,
    to: (c: z.infer<typeof gallerySchema>) => ({
      type: "gallery",
      config: {
        layout: "grid",
        heading: c.heading,
        columns: ["2", "3", "4"].includes(c.columns) ? c.columns : "3",
        items: c.images.map((image) => ({ image: image.url, title: image.caption })),
      },
    }),
  },
  SplideSliderModule: {
    schema: splideSliderSchema,
    to: (c: z.infer<typeof splideSliderSchema>) => ({
      type: "gallery",
      config: {
        layout: "carousel",
        heading: c.heading,
        intro: c.subheading,
        items: c.items.map((item) => ({
          image: item.image,
          title: item.title,
          text: item.description,
          linkText: item.buttonText,
          url: item.buttonUrl,
        })),
      },
    }),
  },
  SplideGallerySyncModule: {
    schema: splideGallerySyncSchema,
    to: (c: z.infer<typeof splideGallerySyncSchema>) => ({
      type: "gallery",
      config: {
        layout: "viewer",
        heading: c.heading,
        items: c.items.map((item) => ({ image: item.image, title: item.title, text: item.description })),
      },
    }),
  },
  SplideLogoTickerModule: {
    schema: splideLogoTickerSchema,
    to: (c: z.infer<typeof splideLogoTickerSchema>) => ({
      type: "ticker",
      config: {
        layout: "logos",
        heading: c.heading,
        items: c.logos.map((logo) => ({ title: logo.name, image: logo.image })),
      },
    }),
  },
  MarqueeModule: {
    schema: marqueeSchema,
    to: (c: z.infer<typeof marqueeSchema>) => ({
      type: "ticker",
      config: {
        layout: "words",
        items: c.items.map((item) => ({ title: item.text, image: item.image })),
        speed: ["slow", "normal", "fast"].includes(c.speed) ? c.speed : "normal",
        direction: c.direction === "right" ? "right" : "left",
      },
    }),
  },

  // Conversion
  FAQSection: {
    schema: faqsectionSchema,
    to: (c: z.infer<typeof faqsectionSchema>) => ({
      type: "faq",
      config: { heading: c.heading, intro: c.subheading, items: c.items, structuredData: true },
    }),
  },
  "faq-list": {
    schema: faqListSchema,
    to: (c: z.infer<typeof faqListSchema>) => ({
      type: "faq",
      config: { ...chapter(c), items: c.items, structuredData: c.structuredData },
    }),
  },
  CTASection: {
    schema: ctasectionSchema,
    to: (c: z.infer<typeof ctasectionSchema>) => ({
      type: "cta",
      config: { layout: "band", heading: c.title, intro: c.subtitle, actions: action(c.buttonText, c.buttonUrl) },
    }),
  },
  "closing-cta": {
    schema: closingCtaSchema,
    to: (c: z.infer<typeof closingCtaSchema>) => ({
      type: "cta",
      config: {
        layout: "closing",
        anchorId: c.anchorId,
        backdrop: c.variant,
        heading: lines(c.titleTop, c.titleBottom),
        intro: c.text,
        actions: action(c.ctaText, c.ctaUrl),
      },
    }),
  },
  LeadMagnetModule: {
    schema: leadMagnetSchema,
    to: (c: z.infer<typeof leadMagnetSchema>) => ({
      type: "cta",
      config: {
        layout: "download",
        heading: c.heading,
        intro: c.subheading,
        actions: [],
        resourceTitle: c.resourceTitle,
        resourceUrl: c.resourceUrl,
        submitLabel: c.buttonText,
        image: c.coverImage,
      },
    }),
  },
  ContactFormModule: {
    schema: contactFormSchema,
    to: (c: z.infer<typeof contactFormSchema>) => ({
      type: "contact",
      config: { heading: c.title, intro: c.subtitle, email: c.emailAddress, phone: c.phoneNumber },
    }),
  },
  PricingModule: {
    schema: pricingSchema,
    to: (c: z.infer<typeof pricingSchema>) => ({
      type: "pricing",
      config: {
        heading: c.heading,
        intro: c.subheading,
        items: c.plans.map((plan) => ({
          title: plan.name,
          value: plan.price,
          suffix: plan.period,
          text: plan.description,
          features: plan.features,
          linkText: plan.buttonText,
          url: plan.buttonUrl,
          highlighted: plan.highlighted,
        })),
      },
    }),
  },
  BlogSection: {
    schema: blogSchema,
    to: (c: z.infer<typeof blogSchema>) => {
      const n = parseInt(c.limit, 10) || 3;
      return {
        type: "posts",
        config: { heading: c.heading, intro: c.subheading, limit: n <= 3 ? "3" : n <= 6 ? "6" : "9" },
      };
    },
  },
};

/** Old types this module can convert (plus the removed ones it drops). */
export const LEGACY_TYPES = new Set([...Object.keys(CONVERTERS), ...REMOVED]);

/** Neutral values for the shared fields, so new defaults never leak demo text into moved content. */
const NEUTRAL: Config = {
  anchorId: "",
  number: "",
  label: "",
  heading: "",
  intro: "",
  aside: "",
  headStyle: "display",
  surface: "default",
};

/**
 * The new-library version of a section.
 * - New types come back unchanged.
 * - Old types are converted. `fallback` is the config an empty old section
 *   used (the module defaults), as the renderer did.
 * - Removed and unknown types return null.
 */
export function migrateSection(section: Section, fallback?: Config): Section | null {
  if (isBlockId(section.type)) return section;
  const converter = CONVERTERS[section.type];
  if (!converter) return null;

  const raw = section.config && Object.keys(section.config).length > 0 ? section.config : (fallback ?? {});
  const parsed = converter.schema.safeParse(raw);
  const old = parsed.success ? parsed.data : converter.schema.parse({});
  const { type, config } = converter.to(old);

  const ownAnchor = typeof raw.anchorId === "string" ? raw.anchorId.trim() : "";
  const anchorId = ownAnchor || (config.anchorId as string | undefined) || LEGACY_ANCHORS[section.type] || "";

  return { ...section, type, config: BLOCK_SCHEMAS[type].parse({ ...NEUTRAL, ...config, anchorId }) as Config };
}
