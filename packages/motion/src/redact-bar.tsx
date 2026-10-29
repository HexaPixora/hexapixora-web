"use client";

import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * A black redaction bar for withheld details that slides in from the left
 * when it scrolls into view. Screen readers hear `label` instead of nothing.
 */
export function RedactBar({
  className,
  width,
  label = "Withheld under NDA",
}: {
  className?: string;
  /** Visual width of the bar, e.g. "140px" or "8ch". */
  width?: string;
  label?: string;
}) {
  const ref = useGsapEffect<HTMLSpanElement>(({ gsap, ScrollTrigger }, el) => {
    if (ScrollTrigger.isInViewport(el)) return;
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  return (
    <span ref={ref} className={className} style={width ? { width } : undefined}>
      <span className="sr-only">{label}</span>
    </span>
  );
}
