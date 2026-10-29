import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { tickerSchema, type TickerConfig } from "@hexapixora/contracts/blocks/ticker";
import type { BlockProps } from "../../lib/block-props";
import { LogosTicker } from "./layouts/logos-ticker";
import { WordsTicker } from "./layouts/words-ticker";

export type TickerItem = TickerConfig["items"][number];
export type TickerLayoutProps = { c: TickerConfig; items: TickerItem[]; headingId: string };

/** A band of words or logos that slides endlessly (CSS only; still under reduced motion). */
export function TickerBlock({ config }: BlockProps) {
  const c = parseBlockConfig(tickerSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.title || item.image);
  if (items.length === 0) return null;
  const Layout = c.layout === "logos" ? LogosTicker : WordsTicker;
  return <Layout c={c} items={items} headingId={headingId} />;
}
