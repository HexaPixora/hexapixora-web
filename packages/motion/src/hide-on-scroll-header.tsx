"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "./load-gsap";

/**
 * A header that turns solid once the page scrolls, slides away while
 * scrolling down and returns on the way up. State is exposed as `data-solid`
 * and `data-away` attributes for the theme to style, set directly on the
 * element so scrolling never re-renders React.
 */
export function HideOnScrollHeader({
  children,
  className,
  part,
  solidAfter = 80,
}: {
  children: ReactNode;
  className?: string;
  /** A data-part hook for themes. */
  part?: string;
  /** Scroll distance in px after which the header gets its background. */
  solidAfter?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion keeps the header in place; it only changes background.
    const reduce = prefersReducedMotion();
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      el.toggleAttribute("data-solid", y > solidAfter);
      if (!reduce) {
        if (y > window.innerHeight * 0.6 && y > lastY + 4) el.setAttribute("data-away", "");
        else if (y < lastY - 4 || y <= solidAfter) el.removeAttribute("data-away");
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [solidAfter]);

  return (
    <header ref={ref} data-part={part} className={className}>
      {children}
    </header>
  );
}
