import { useId, type ComponentType } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { heroSchema, type HeroConfig } from "@hexapixora/contracts/blocks/hero";
import type { BlockProps } from "../../lib/block-props";
import type { HeroLayoutProps } from "./hero-layout";
import { FilmHero } from "./layouts/film-hero";
import { ImageHero } from "./layouts/image-hero";
import { ProfileHero } from "./layouts/profile-hero";
import { SplitHero } from "./layouts/split-hero";
import { StatsHero } from "./layouts/stats-hero";
import { TypeHero } from "./layouts/type-hero";

const LAYOUTS: Record<HeroConfig["layout"], ComponentType<HeroLayoutProps>> = {
  film: FilmHero,
  image: ImageHero,
  split: SplitHero,
  stats: StatsHero,
  type: TypeHero,
  profile: ProfileHero,
};

/** The top of a page. Its heading is always the page's <h1>. */
export function HeroBlock({ config }: BlockProps) {
  const c = parseBlockConfig(heroSchema, config);
  const titleId = useId();
  const Layout = LAYOUTS[c.layout];
  return <Layout c={c} titleId={titleId} />;
}
