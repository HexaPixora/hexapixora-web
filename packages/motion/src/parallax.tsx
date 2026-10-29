"use client";

import type { ReactNode } from "react";
import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * A background layer that moves slower than the page while its section
 * scrolls past (scrubbed). The layer is oversized by the theme (e.g. 130%
 * tall) so the movement never reveals an edge; at rest it sits centred.
 */
export function Parallax({
  children,
  className,
  strength = 10,
}: {
  children: ReactNode;
  className?: string;
  /** Travel in percent of the layer's own height, each way. */
  strength?: number;
}) {
  const ref = useGsapEffect<HTMLDivElement>(({ gsap }, el) => {
    gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      {children}
    </div>
  );
}
