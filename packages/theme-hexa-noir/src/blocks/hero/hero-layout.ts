import type { HeroConfig } from "@hexapixora/contracts/blocks/hero";

export type HeroLayoutProps = { c: HeroConfig; titleId: string };

/** The heading's lines: each line break in the CMS starts a new rising line. */
export const headingLines = (heading: string) =>
  heading
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
