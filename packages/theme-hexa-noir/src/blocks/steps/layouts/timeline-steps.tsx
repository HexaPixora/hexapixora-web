import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { DrawLine } from "@hexapixora/motion/draw-line";
import type { StepsLayoutProps } from "../steps-block";

/** Dated steps along a vertical line that draws itself while scrolling. */
export function TimelineSteps({ items }: StepsLayoutProps) {
  return (
    <div className="relative max-w-[880px]">
      <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-line" />
      <DrawLine
        axis="y"
        className="absolute bottom-0 left-[4.5px] top-2 block w-0.5 bg-signal shadow-[0_0_14px_var(--color-signal)]"
      />
      <ol className="grid gap-12">
        {items.map((item, i) => (
          <ClipReveal key={i} as="li" className="relative pl-12">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-signal shadow-[0_0_16px_var(--color-signal)]"
            />
            {item.label ? <p className="mono text-signal">{item.label}</p> : null}
            {item.title ? <h3 className="wide mt-2 text-[22px] font-medium">{item.title}</h3> : null}
            {item.text ? <p className="mt-2 max-w-[60ch] text-copy-dim">{item.text}</p> : null}
          </ClipReveal>
        ))}
      </ol>
    </div>
  );
}
