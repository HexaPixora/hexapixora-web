import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { timelineSchema } from "@hexapixora/contracts/blocks/timeline";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { DrawLine } from "@hexapixora/motion/draw-line";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

const SCRIM: Record<string, number> = { none: 0, light: 0.3, medium: 0.6, dark: 0.8 };

/**
 * Dated steps along a vertical line that draws itself while scrolling. An
 * optional background photo sits under a scrim; the stored line colour is
 * ignored (the theme owns colour).
 */
export function TimelineBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(timelineSchema, config);
  const headingId = useId();
  const steps = c.steps.filter((step) => step.title || step.text || step.date);
  const image = safeHref(c.backgroundImage);
  if (steps.length === 0) return null;

  return (
    <SectionFrame
      block="timeline"
      labelledBy={c.heading ? headingId : undefined}
      className="isolate overflow-hidden"
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
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-page" style={{ opacity: SCRIM[c.overlay] ?? 0.6 }} />
          </>
        ) : null
      }
    >
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <div className="relative max-w-[880px]">
        <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-line" />
        <DrawLine axis="y" className="absolute bottom-0 left-[4.5px] top-2 block w-0.5 bg-signal shadow-[0_0_14px_var(--color-signal)]" />
        <ol className="grid gap-12">
          {steps.map((step, i) => (
            <ClipReveal key={i} as="li" className="relative pl-12">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-signal shadow-[0_0_16px_var(--color-signal)]"
              />
              {step.date ? <p className="mono text-signal">{step.date}</p> : null}
              {step.title ? <h3 className="wide mt-2 text-[22px] font-medium">{step.title}</h3> : null}
              {step.text ? <p className="mt-2 max-w-[60ch] text-copy-dim">{step.text}</p> : null}
            </ClipReveal>
          ))}
        </ol>
      </div>
    </SectionFrame>
  );
}
