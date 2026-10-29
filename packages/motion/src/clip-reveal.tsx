"use client";

import type { ReactNode } from "react";
import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * Wipes its content in from the top edge (clip-path) with a short rise, the
 * first time it scrolls into view. Content already on screen when GSAP loads
 * is left alone, so nothing above the fold blinks out and back in.
 */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useGsapEffect<HTMLDivElement>(({ gsap, ScrollTrigger }, el) => {
    if (ScrollTrigger.isInViewport(el, 0.1)) return;
    gsap.from(el, {
      clipPath: "inset(0 0 100% 0)",
      y: 30,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
