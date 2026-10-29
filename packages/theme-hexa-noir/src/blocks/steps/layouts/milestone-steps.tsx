import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import type { StepsLayoutProps } from "../steps-block";

/** Milestones as rows: the year large on the left, the story on the right. */
export function MilestoneSteps({ items }: StepsLayoutProps) {
  return (
    <ol>
      {items.map((item, i) => (
        <ClipReveal
          key={i}
          as="li"
          className="grid gap-4 border-t border-line py-9 last:border-b md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10"
        >
          <span className="font-display text-display-md font-medium leading-none text-signal">{item.label}</span>
          <div>
            {item.title ? <h3 className="wide text-title font-medium">{item.title}</h3> : null}
            {item.text ? <p className="mt-2 max-w-[56ch] text-copy-dim">{item.text}</p> : null}
          </div>
        </ClipReveal>
      ))}
    </ol>
  );
}
