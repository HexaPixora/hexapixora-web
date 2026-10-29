"use client";

import type { ReactNode } from "react";
import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * Moves its content by a percentage of its own size while the nearest
 * section scrolls out of view (scrubbed), e.g. hero tiles drifting apart.
 */
export function Drift({
  children,
  className,
  x = 0,
  y = 0,
}: {
  children?: ReactNode;
  className?: string;
  /** Horizontal travel in percent of the element's width. */
  x?: number;
  /** Vertical travel in percent of the element's height. */
  y?: number;
}) {
  const ref = useGsapEffect<HTMLDivElement>(({ gsap }, el) => {
    gsap.to(el, {
      xPercent: x,
      yPercent: y,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section") ?? el,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
