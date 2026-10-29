import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { statsSchema } from "@hexapixora/contracts/blocks/legacy/stats";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { StatGrid } from "../../components/stat-grid";

/** Up to four headline numbers. */
export function StatsBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(statsSchema, config);
  const headingId = useId();
  const stats = [
    { value: c.stat1Value, label: c.stat1Label },
    { value: c.stat2Value, label: c.stat2Label },
    { value: c.stat3Value, label: c.stat3Label },
    { value: c.stat4Value, label: c.stat4Label },
  ].filter((stat) => stat.value || stat.label);
  if (stats.length === 0) return null;

  return (
    <SectionFrame block="stats" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <StatGrid stats={stats} />
    </SectionFrame>
  );
}
