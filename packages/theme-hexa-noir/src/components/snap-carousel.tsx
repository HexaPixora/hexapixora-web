"use client";

import { useRef, type ReactNode } from "react";

/**
 * A row of slides using native scroll snapping: swipe, trackpad and keyboard
 * scrolling work without a carousel library, and every slide is in the HTML.
 * The arrow buttons scroll by one slide width.
 */
export function SnapCarousel({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  /** Accessible name for the carousel region. */
  label: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const step = slide ? slide.getBoundingClientRect().width : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const arrow = "mono grid h-11 w-11 place-items-center border border-line transition-colors duration-300 hover:border-signal hover:text-signal";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={className}>
      <div
        ref={trackRef}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => scrollBy(-1)} className={arrow} aria-label="Previous slide">
          ←
        </button>
        <button type="button" onClick={() => scrollBy(1)} className={arrow} aria-label="Next slide">
          →
        </button>
      </div>
    </div>
  );
}
