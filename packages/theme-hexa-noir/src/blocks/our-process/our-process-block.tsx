import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { ourProcessSchema } from "@hexapixora/contracts/blocks/legacy/our-process";
import { DrawLine } from "@hexapixora/motion/draw-line";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

/** Numbered steps on a line that draws itself, like the process steps block. */
export function OurProcessBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(ourProcessSchema, config);
  const headingId = useId();
  const steps = c.steps.filter((step) => step.title || step.description);
  if (!c.heading && steps.length === 0) return null;
  // Three or six steps sit better three across than four.
  const columns = steps.length % 3 === 0 && steps.length % 4 !== 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <SectionFrame block="our-process" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-x-0 top-2.5 h-px bg-line" />
        <DrawLine className="absolute inset-x-0 top-2.5 block h-0.5 bg-signal shadow-[0_0_14px_var(--color-signal)]" />
        <ol className={`grid gap-12 pt-10 sm:grid-cols-2 md:gap-6 ${columns}`}>
          {steps.map((step, i) => (
            <li key={i} data-part="step" className="relative">
              <span className="mono">Step {String(i + 1).padStart(2, "0")}</span>
              {step.title ? <h3 className="wide my-2 text-[22px] font-medium">{step.title}</h3> : null}
              {step.description ? <p className="text-copy-dim">{step.description}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </SectionFrame>
  );
}
