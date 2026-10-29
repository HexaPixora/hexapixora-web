import { useId, type ComponentType } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { cardsSchema, type CardsConfig } from "@hexapixora/contracts/blocks/cards";
import { Actions } from "../../components/actions";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { GridCards } from "./layouts/grid-cards";
import { IconCards } from "./layouts/icon-cards";
import { LogoCards } from "./layouts/logo-cards";
import { MeterCards } from "./layouts/meter-cards";
import { PillarCards } from "./layouts/pillar-cards";

export type CardItem = CardsConfig["items"][number];

const LAYOUTS: Record<CardsConfig["layout"], ComponentType<{ items: CardItem[] }>> = {
  grid: GridCards,
  icons: IconCards,
  pillars: PillarCards,
  logos: LogoCards,
  meters: MeterCards,
};

/** A set of items in one of five arrangements, under the shared heading. */
export function CardsBlock({ config }: BlockProps) {
  const c = parseBlockConfig(cardsSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.title || item.text);
  if (!c.heading && items.length === 0) return null;
  const Layout = LAYOUTS[c.layout];

  return (
    <SectionFrame block="cards" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      {items.length > 0 ? <Layout items={items} /> : null}
      <Actions actions={c.actions} className="mt-12" />
    </SectionFrame>
  );
}
