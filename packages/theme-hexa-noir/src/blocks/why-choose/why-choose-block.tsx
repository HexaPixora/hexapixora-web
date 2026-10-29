import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { whyChooseSchema } from "@hexapixora/contracts/blocks/why-choose";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ContentIcon } from "../../components/content-icon";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/** Reasons to choose the studio, as a ruled grid of icon cards. */
export function WhyChooseBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(whyChooseSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.title || item.description);
  if (!c.heading && items.length === 0) return null;

  return (
    <SectionFrame block="why-choose" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <ClipReveal
            key={i}
            as="li"
            className="grid content-start gap-4 bg-page p-7 transition-colors duration-[400ms] hover:bg-page-raised"
          >
            <ContentIcon name={item.icon} className="h-7 w-7 text-signal" />
            {item.title ? <h3 className="wide text-title font-medium">{item.title}</h3> : null}
            {item.description ? <p className="text-copy-dim">{item.description}</p> : null}
          </ClipReveal>
        ))}
      </ul>
    </SectionFrame>
  );
}
