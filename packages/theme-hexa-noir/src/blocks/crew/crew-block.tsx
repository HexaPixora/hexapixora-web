import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { crewSchema } from "@hexapixora/contracts/blocks/crew";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { ChapterHeading } from "../../components/chapter-heading";
import { SectionFrame } from "../../components/section-frame";

export function CrewBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(crewSchema, config);
  const headingId = useId();
  if (c.items.length === 0) return null;

  return (
    <SectionFrame block="crew" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
        {c.items.map((item, i) => (
          <ClipReveal
            key={i}
            as="li"
            className={`grid min-h-[220px] content-between gap-[18px] p-7 transition-colors duration-[400ms] ${
              item.lead ? "bg-signal text-on-signal" : "bg-page hover:bg-page-raised"
            }`}
          >
            <span data-part="crew-meta" className="mono">{item.availability}</span>
            <div>
              <h3 className="wide mb-2.5 text-title font-medium">{item.role}</h3>
              <p className={`min-h-[3.1em] ${item.lead ? "text-on-signal-dim" : "text-copy-dim"}`}>{item.description}</p>
            </div>
          </ClipReveal>
        ))}
      </ul>
      {c.note ? <p className="mt-[22px] text-copy-dim">{c.note}</p> : null}
    </SectionFrame>
  );
}
