import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { ourStorySchema } from "@hexapixora/contracts/blocks/legacy/our-story";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/** Milestones as rows: the year large on the left, the story on the right. */
export function OurStoryBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(ourStorySchema, config);
  const headingId = useId();
  const milestones = c.milestones.filter((item) => item.title || item.description || item.year);
  if (!c.heading && milestones.length === 0) return null;

  return (
    <SectionFrame block="our-story" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />
      <ol>
        {milestones.map((item, i) => (
          <ClipReveal
            key={i}
            as="li"
            className="grid gap-4 border-t border-line py-9 last:border-b md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10"
          >
            <span className="font-display text-display-md font-medium leading-none text-signal">{item.year}</span>
            <div>
              {item.title ? <h3 className="wide text-title font-medium">{item.title}</h3> : null}
              {item.description ? <p className="mt-2 max-w-[56ch] text-copy-dim">{item.description}</p> : null}
            </div>
          </ClipReveal>
        ))}
      </ol>
    </SectionFrame>
  );
}
