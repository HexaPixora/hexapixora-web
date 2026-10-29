import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { scrollytellingSchema } from "@hexapixora/contracts/blocks/scrollytelling";
import { SectionFrame } from "../../components/section-frame";
import { mediaAlt } from "../../lib/media-alt";
import { ScrollStory } from "./scroll-story";

/**
 * Steps that scroll past a pinned panel on wide screens: the panel shows the
 * active step's image and number. The copy is server-rendered; only the
 * "which step is active" tracking runs on the client.
 */
export function ScrollytellingBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(scrollytellingSchema, config);
  const headingId = useId();
  const steps = c.steps
    .filter((step) => step.title || step.text || step.image)
    .map((step) => {
      const image = safeHref(step.image);
      return { ...step, image: image ?? "", alt: image ? mediaAlt(image, step.title) : "" };
    });
  if (steps.length === 0) return null;

  return (
    <SectionFrame block="scrollytelling" labelledBy={c.heading ? headingId : undefined}>
      {c.heading ? (
        <h2 id={headingId} className="wide mb-chapter max-w-[20ch] text-display-md font-medium">
          {c.heading}
        </h2>
      ) : null}
      <ScrollStory steps={steps} />
    </SectionFrame>
  );
}
