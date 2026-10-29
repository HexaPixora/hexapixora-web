import type { CSSProperties, ReactNode } from "react";

/**
 * An endless horizontal row, animated in CSS only (styles/motion.css), so it
 * needs no JavaScript and renders on the server. The second copy of the items
 * is hidden from screen readers; the first is the real content.
 */
export function Marquee({
  children,
  duration = 30,
  direction = "left",
  className,
  gapClassName = "gap-12",
}: {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  direction?: "left" | "right";
  className?: string;
  gapClassName?: string;
}) {
  return (
    <div data-marquee="" data-direction={direction} className={className}>
      <div data-marquee-track="" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        <div className={`flex shrink-0 items-center pr-12 ${gapClassName}`}>{children}</div>
        <div aria-hidden="true" className={`flex shrink-0 items-center pr-12 ${gapClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
