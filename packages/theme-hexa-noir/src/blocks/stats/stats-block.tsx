import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { statsSchema } from "@hexapixora/contracts/blocks/stats";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import { StatGrid } from "../../components/stat-grid";
import type { BlockProps } from "../../lib/block-props";

/** Key numbers in a ruled grid; "counters" counts them up on first view. */
export function StatsBlock({ config }: BlockProps) {
  const c = parseBlockConfig(statsSchema, config);
  const headingId = useId();
  const stats = c.items
    .filter((stat) => stat.value || stat.label)
    .map((stat) => ({ value: `${stat.value}${stat.suffix}`, label: stat.label }));
  if (stats.length === 0) return null;

  return (
    <SectionFrame block="stats" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      <StatGrid stats={stats} count={c.layout === "counters"} />
    </SectionFrame>
  );
}
