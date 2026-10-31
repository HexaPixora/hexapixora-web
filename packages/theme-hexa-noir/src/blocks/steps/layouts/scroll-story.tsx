"use client";

import { useEffect, useRef, useState } from "react";
import { MediaImage } from "../../../components/media-image";

type Step = { title: string; text: string; image: string; alt: string };

/**
 * The pinned panel plus the steps. An IntersectionObserver marks the step
 * crossing the middle of the screen as active; no animation library needed.
 * Every step's text and image are in the HTML from the start.
 */
export function ScrollStory({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      // A thin band across the middle of the viewport.
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div aria-hidden="true" className="hidden md:block">
        <div className="sticky top-[calc(var(--header-h)+24px)] aspect-square overflow-hidden border border-line bg-page-raised">
          {steps.map((step, i) =>
            step.image ? (
              <MediaImage
                key={i}
                src={step.image}
                alt=""
                fill
                sizes="(min-width: 1440px) 680px, (min-width: 768px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null,
          )}
          <span className="absolute bottom-5 left-6 font-display text-display-lg font-bold leading-none text-copy">
            {String(active + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <ol>
        {steps.map((step, i) => (
          <li
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-index={i}
            className="flex min-h-[70vh] flex-col justify-center py-10"
          >
            {step.image ? (
              <MediaImage
                src={step.image}
                alt={step.alt}
                sizes="100vw"
                className="mb-6 h-auto w-full border border-line md:hidden"
              />
            ) : null}
            <span className={`mono transition-colors ${i === active ? "text-signal" : "text-copy-dim"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {step.title ? (
              <h3 className="wide mt-3 text-[clamp(1.5rem,3vw,2.4rem)] font-medium">{step.title}</h3>
            ) : null}
            {step.text ? <p className="mt-4 max-w-[52ch] text-lg text-copy-dim">{step.text}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
