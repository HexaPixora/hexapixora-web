"use client";

import type { ReactNode } from "react";
import { useGsapEffect } from "@hexapixora/motion/hooks/use-gsap-effect";

/**
 * Pins the section and slides the card row left as the page scrolls. The
 * row starts as a native horizontal scroller (overflow-x), so before GSAP
 * loads, without JS or with reduced motion, it can still be swiped.
 */
export function PinnedTrack({ header, children }: { header?: ReactNode; children: ReactNode }) {
  const ref = useGsapEffect<HTMLDivElement>(({ gsap }, el) => {
    const track = el.querySelector<HTMLElement>("[data-part='track']");
    if (!track) return;
    // Pinning drives the movement now, so the native scroller is switched off.
    track.style.overflowX = "visible";
    const distance = () => Math.max(0, track.scrollWidth - el.clientWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  });

  return (
    <div ref={ref} className="flex min-h-svh flex-col">
      {header}
      <div
        data-part="track"
        className="flex flex-1 items-center gap-6 overflow-x-auto px-[max(20px,calc((100vw-var(--container-page))/2+20px))] py-12"
      >
        {children}
      </div>
    </div>
  );
}
