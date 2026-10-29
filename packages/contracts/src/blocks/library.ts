import type { z } from "zod";
import type { ModuleDefinition } from "./types";
import { CardsDef, cardsSchema } from "./cards";
import { ContactDef, contactSchema } from "./contact";
import { CtaDef, ctaSchema } from "./cta";
import { FaqDef, faqSchema } from "./faq";
import { GalleryDef, gallerySchema } from "./gallery";
import { HeroDef, heroSchema } from "./hero";
import { PeopleDef, peopleSchema } from "./people";
import { PostsDef, postsSchema } from "./posts";
import { PricingDef, pricingSchema } from "./pricing";
import { ProductsDef, productsSchema } from "./products";
import { QuoteDef, quoteSchema } from "./quote";
import { StatsDef, statsSchema } from "./stats";
import { StepsDef, stepsSchema } from "./steps";
import { TextDef, textSchema } from "./text";
import { TickerDef, tickerSchema } from "./ticker";
import { WorkDef, workSchema } from "./work";

/**
 * The block library (plans/phase-3c): 16 reusable blocks, each with a Layout
 * option. A stored section's `type` is one of these ids.
 */
export const BLOCKS = {
  hero: HeroDef,
  text: TextDef,
  quote: QuoteDef,
  cards: CardsDef,
  steps: StepsDef,
  stats: StatsDef,
  people: PeopleDef,
  work: WorkDef,
  products: ProductsDef,
  gallery: GalleryDef,
  ticker: TickerDef,
  faq: FaqDef,
  cta: CtaDef,
  contact: ContactDef,
  pricing: PricingDef,
  posts: PostsDef,
} satisfies Record<string, ModuleDefinition>;

export type BlockId = keyof typeof BLOCKS;

/** Each block's config schema: validation and defaults for stored sections. */
export const BLOCK_SCHEMAS: Record<BlockId, z.ZodType> = {
  hero: heroSchema,
  text: textSchema,
  quote: quoteSchema,
  cards: cardsSchema,
  steps: stepsSchema,
  stats: statsSchema,
  people: peopleSchema,
  work: workSchema,
  products: productsSchema,
  gallery: gallerySchema,
  ticker: tickerSchema,
  faq: faqSchema,
  cta: ctaSchema,
  contact: contactSchema,
  pricing: pricingSchema,
  posts: postsSchema,
};

export const isBlockId = (type: unknown): type is BlockId => typeof type === "string" && Object.hasOwn(BLOCKS, type);

/** How the editor groups the blocks, in display order. */
export const BLOCK_GROUPS: { label: string; blocks: BlockId[] }[] = [
  { label: "Openers", blocks: ["hero", "text", "quote"] },
  { label: "Content", blocks: ["cards", "steps", "stats", "people"] },
  { label: "Work & media", blocks: ["work", "products", "gallery", "ticker", "posts"] },
  { label: "Conversion", blocks: ["cta", "contact", "pricing", "faq"] },
];
