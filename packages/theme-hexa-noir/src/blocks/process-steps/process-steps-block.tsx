import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { processStepsSchema } from "@hexapixora/contracts/blocks/legacy/process-steps";
import { DrawLine } from "@hexapixora/motion/draw-line";
import { ChapterHeading } from "../../components/chapter-heading";
import { SectionFrame } from "../../components/section-frame";

/** "Delivered *on the agreed date*." → text with the starred part in bold. Text only, never HTML. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split("*").map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className="font-bold text-signal">
            {part}
          </b>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function ProcessStepsBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(processStepsSchema, config);
  const headingId = useId();
  if (c.steps.length === 0) return null;

  return (
    <SectionFrame block="process-steps" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-x-0 top-2.5 h-px bg-line" />
        <DrawLine className="absolute inset-x-0 top-2.5 block h-0.5 bg-signal shadow-[0_0_14px_var(--color-signal)]" />
        <ol className="grid gap-12 pt-10 md:grid-cols-4 md:gap-6">
          {c.steps.map((step, i) => (
            <li key={i} data-part="step" className="relative">
              <span className="mono">{step.label}</span>
              <h3 className="wide my-2 text-[22px] font-medium">{step.title}</h3>
              <p className="text-copy-dim">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
      {c.promise ? (
        <p className="mt-[50px] font-display text-promise font-light">
          <Highlighted text={c.promise} />
        </p>
      ) : null}
    </SectionFrame>
  );
}
