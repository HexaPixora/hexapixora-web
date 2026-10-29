import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { workSchema, type WorkConfig } from "@hexapixora/contracts/blocks/work";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { DossierWork } from "./layouts/dossier-work";
import { GridWork } from "./layouts/grid-work";
import { ScrollWork } from "./layouts/scroll-work";
import { StaggeredWork } from "./layouts/staggered-work";

export type WorkItem = WorkConfig["items"][number];

/** Projects as a grid, NDA case files, staggered cards or a pinned side-scroll. */
export function WorkBlock({ config }: BlockProps) {
  const c = parseBlockConfig(workSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.title || item.image);
  if (items.length === 0 && c.stats.length === 0) return null;

  // The side-scroll pins its own full-width section.
  if (c.layout === "scroll") return <ScrollWork c={c} items={items} headingId={headingId} />;

  return (
    <SectionFrame
      block="work"
      variant={c.layout === "dossier" ? `dossier-${c.finish}` : c.layout}
      surface={c.surface}
      labelledBy={labelledBy(headingId, c)}
    >
      <BlockHead id={headingId} head={c} />
      {c.layout === "dossier" ? (
        <DossierWork items={items} stats={c.stats} />
      ) : c.layout === "staggered" ? (
        <StaggeredWork items={items} />
      ) : (
        <GridWork items={items} />
      )}
      {c.note ? <p className="mt-[22px] text-copy-dim">{c.note}</p> : null}
    </SectionFrame>
  );
}
