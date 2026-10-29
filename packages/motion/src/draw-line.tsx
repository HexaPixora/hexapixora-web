"use client";

import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * A rule that draws itself while its parent scrolls through the viewport
 * (scrubbed). Style it with `className`; it renders full length at rest.
 */
export function DrawLine({ className, axis = "x" }: { className?: string; axis?: "x" | "y" }) {
  const ref = useGsapEffect<HTMLSpanElement>(({ gsap }, el) => {
    gsap.from(el, {
      [axis === "x" ? "scaleX" : "scaleY"]: 0,
      transformOrigin: axis === "x" ? "left center" : "center top",
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top 70%",
        end: "center 50%",
        scrub: true,
      },
    });
  });

  return <span ref={ref} aria-hidden="true" className={className} />;
}
