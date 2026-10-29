"use client";

import type { ReactNode } from "react";
import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * Wipes its content in from the top edge (clip-path) with a short rise, the
 * first time it scrolls into view. Content already on screen when GSAP loads
 * is left alone, so nothing above the fold blinks out and back in. `as` keeps
 * the markup semantic (a list item, an article) instead of adding a wrapper.
 */
export function ClipReveal({
  children,
  className,
  as: Tag = "div",
  part,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  /** Sets `data-part`, the hook theme CSS uses to style this element. */
  part?: string;
}) {
  const ref = useGsapEffect<HTMLElement>(({ gsap, ScrollTrigger }, el) => {
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
    <Tag ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>} className={className} data-part={part}>
      {children}
    </Tag>
  );
}
