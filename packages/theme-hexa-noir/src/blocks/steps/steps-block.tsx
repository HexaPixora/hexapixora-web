import { useId, type ComponentType } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { stepsSchema, type StepsConfig } from "@hexapixora/contracts/blocks/steps";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { MilestoneSteps } from "./layouts/milestone-steps";
import { RowSteps } from "./layouts/row-steps";
import { StorySteps } from "./layouts/story-steps";
import { TimelineSteps } from "./layouts/timeline-steps";

export type StepItem = StepsConfig["items"][number];
export type StepsLayoutProps = { items: StepItem[]; note: string };

const LAYOUTS: Record<StepsConfig["layout"], ComponentType<StepsLayoutProps>> = {
  row: RowSteps,
  timeline: TimelineSteps,
  milestones: MilestoneSteps,
  story: StorySteps,
};

const SCRIM: Record<string, number> = { none: 0, light: 0.3, medium: 0.6, dark: 0.8 };

/** A sequence: a process, a timeline, milestones by year, or a scroll story. */
export function StepsBlock({ config }: BlockProps) {
  const c = parseBlockConfig(stepsSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.title || item.text || item.label || item.image);
  if (items.length === 0) return null;
  const Layout = LAYOUTS[c.layout];
  // Only the timeline takes a background photo, under a scrim.
  const image = c.layout === "timeline" ? safeHref(c.image) : undefined;

  return (
    <SectionFrame
      block="steps"
      variant={c.layout}
      surface={c.surface}
      labelledBy={labelledBy(headingId, c)}
      className={image ? "isolate overflow-hidden" : ""}
      backdrop={
        image ? (
          <>
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-page"
              style={{ opacity: SCRIM[c.overlay] ?? 0.6 }}
            />
          </>
        ) : null
      }
    >
      <BlockHead id={headingId} head={c} />
      <Layout items={items} note={c.note} />
    </SectionFrame>
  );
}
