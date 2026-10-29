import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { BlockId } from "@hexapixora/contracts/blocks/library";
import type { BlockProps } from "./lib/block-props";

type BlockComponent = ComponentType<BlockProps>;

/**
 * Library block id → component (plans/phase-3c). Each block is its own
 * chunk, so a page only loads the blocks it uses.
 */
export const LIBRARY_BLOCKS: Record<BlockId, BlockComponent> = {
  hero: dynamic(() => import("./blocks/hero/hero-block").then((m) => m.HeroBlock)),
  text: dynamic(() => import("./blocks/text/text-block").then((m) => m.TextBlock)),
  quote: dynamic(() => import("./blocks/quote/quote-block").then((m) => m.QuoteBlock)),
  cards: dynamic(() => import("./blocks/cards/cards-block").then((m) => m.CardsBlock)),
  steps: dynamic(() => import("./blocks/steps/steps-block").then((m) => m.StepsBlock)),
  stats: dynamic(() => import("./blocks/stats/stats-block").then((m) => m.StatsBlock)),
  people: dynamic(() => import("./blocks/people/people-block").then((m) => m.PeopleBlock)),
  work: dynamic(() => import("./blocks/work/work-block").then((m) => m.WorkBlock)),
  products: dynamic(() => import("./blocks/products/products-block").then((m) => m.ProductsBlock)),
  gallery: dynamic(() => import("./blocks/gallery/gallery-block").then((m) => m.GalleryBlock)),
  ticker: dynamic(() => import("./blocks/ticker/ticker-block").then((m) => m.TickerBlock)),
  faq: dynamic(() => import("./blocks/faq/faq-block").then((m) => m.FaqBlock)),
  cta: dynamic(() => import("./blocks/cta/cta-block").then((m) => m.CtaBlock)),
  contact: dynamic(() => import("./blocks/contact/contact-block").then((m) => m.ContactBlock)),
  pricing: dynamic(() => import("./blocks/pricing/pricing-block").then((m) => m.PricingBlock)),
  posts: dynamic(() => import("./blocks/posts/posts-block").then((m) => m.PostsBlock)),
};
