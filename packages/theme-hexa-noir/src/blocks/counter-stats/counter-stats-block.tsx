import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { counterStatsSchema } from "@hexapixora/contracts/blocks/legacy/counter-stats";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { StatGrid } from "../../components/stat-grid";

/** Numbers that count up, each with its own suffix ("+", "%", "/7"). */
export function CounterStatsBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(counterStatsSchema, config);
  const headingId = useId();
  const stats = c.stats
    .filter((stat) => stat.value || stat.label)
    .map((stat) => ({ value: `${stat.value}${stat.suffix}`, label: stat.label }));
  if (stats.length === 0) return null;

  return (
    <SectionFrame block="counter-stats" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <StatGrid stats={stats} />
    </SectionFrame>
  );
}
