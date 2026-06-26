"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { timelineSchema, TimelineProps } from "@/lib/module-schemas/timeline-schema";

export default function TimelineModule({ config }: { config?: TimelineProps }) {
  const { heading, subheading, lineColor, steps } = timelineSchema.parse(config || {});
  const items = (steps || []).filter((s: any) => s.title || s.text || s.date);
  const lc = lineColor?.trim();
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!root.current || items.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (fill.current && track.current) {
        gsap.fromTo(
          fill.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top",
            ease: "none",
            scrollTrigger: { trigger: track.current, start: "top 70%", end: "bottom 80%", scrub: true },
          }
        );
      }
      stepEls.current.forEach((el) => {
        if (!el) return;
        gsap.from(el, { opacity: 0, y: 28, duration: 0.6, scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    }, root);
    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) {
    return (
      <section className="container py-24">
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          Add steps to the Timeline in the CMS.
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="py-20 md:py-28 bg-background">
      <div className="container max-w-3xl">
        {(heading || subheading) && (
          <header className="text-center mb-16">
            {heading && <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{heading}</h2>}
            {subheading && <p className="mt-3 text-lg text-muted-foreground">{subheading}</p>}
          </header>
        )}

        <div ref={track} className="relative">
          {/* Line track + animated fill */}
          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-border overflow-hidden">
            <div
              ref={fill}
              className={`w-full h-full ${lc ? "" : "bg-primary"}`}
              style={{ transform: "scaleY(0)", transformOrigin: "top", ...(lc ? { backgroundColor: lc } : {}) }}
            />
          </div>

          <div className="flex flex-col gap-12">
            {items.map((s: any, i: number) => (
              <div
                key={i}
                ref={(el) => { stepEls.current[i] = el; }}
                className="relative pl-10"
              >
                <span
                  className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-background ${lc ? "" : "border-primary"}`}
                  style={lc ? { borderColor: lc } : undefined}
                />
                {s.date && <span className="text-sm font-semibold text-primary">{s.date}</span>}
                <h3 className="text-xl md:text-2xl font-bold mt-1">{s.title}</h3>
                {s.text && <p className="text-muted-foreground mt-2 leading-relaxed">{s.text}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
