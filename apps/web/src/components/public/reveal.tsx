"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Wraps a section so it fades + rises into view the first time it enters the
 * viewport. Styling lives in globals.css (`[data-reveal]`), gated on `.js` so
 * content is visible without JS, and disabled under reduced-motion (here and
 * in the CSS). Fires once, then disconnects.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"out" | "in">("out");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion users: show immediately, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("in");
            io.disconnect();
            break;
          }
        }
      },
      // Trigger a touch before fully in view so it feels natural.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={state}>
      {children}
    </div>
  );
}
