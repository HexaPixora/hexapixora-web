"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { timelineSchema, TimelineProps } from "@/lib/module-schemas/timeline-schema";

export default function TimelineModule({ config }: { config?: TimelineProps }) {
  const { heading, subheading, lineColor, backgroundImage, overlay, steps } = timelineSchema.parse(config || {});
  const items = (steps || []).filter((s: any) => s.title || s.text || s.date);
  const bg = backgroundImage?.trim();
  // Accent for the line, dots and date pill. Bright brand blue by default so it
  // reads on the dark theme; the CMS "Line Color" overrides it.
  const accent = lineColor?.trim() || "#1093fd";
  const overlayClass: Record<string, string> = {
    light: "bg-background/30",
    medium: "bg-background/60",
    dark: "bg-background/80",
  };
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl || items.length === 0) return;
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
      const els = stepEls.current.filter(Boolean) as HTMLElement[];
      gsap.set(els, { opacity: 0, y: 28 });
      els.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: true }),
        });
      });
    }, rootEl);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(t); ctx.revert(); };
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
    <section
      ref={root}
      className="relative overflow-hidden py-20 md:py-28"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {bg && overlay !== "none" && (
        <div className={`absolute inset-0 z-0 ${overlayClass[overlay] ?? "bg-background/60"}`} />
      )}
      {/* Soft brand aurora for depth (only when no background image is set). */}
      {!bg && (
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 -z-0 h-[50vh] w-[50vh] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: accent }} />
      )}

      <div className="container relative z-10 max-w-4xl">
        {(heading || subheading) && (
          <header className="mb-16 text-center md:mb-20">
            {heading && <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>}
            {subheading && <p className="mt-3 text-lg text-muted-foreground">{subheading}</p>}
          </header>
        )}

        <div ref={track} className="relative">
          {/* Vertical line — left on mobile, centered on desktop. Faint track with
              an animated brand-tinted fill that draws in as you scroll. */}
          <div className="pointer-events-none absolute bottom-1 top-1 left-4 w-0.5 -translate-x-1/2 overflow-hidden rounded-full md:left-1/2">
            <div className="absolute inset-0 bg-white/10" />
            <div
              ref={fill}
              className="absolute inset-0 origin-top"
              style={{ backgroundImage: `linear-gradient(to bottom, ${accent}, ${accent}33)`, transform: "scaleY(0)" }}
            />
          </div>

          <div className="flex flex-col gap-8 md:gap-y-4">
            {items.map((s: any, i: number) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  ref={(el) => { stepEls.current[i] = el; }}
                  className="relative pl-12 md:grid md:grid-cols-2 md:gap-x-12 md:pl-0"
                >
                  {/* Glowing node dot on the line. */}
                  <span
                    aria-hidden
                    className="absolute left-4 top-3 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full md:left-1/2"
                    style={{ background: accent, boxShadow: `0 0 0 4px ${accent}22, 0 0 16px 2px ${accent}80` }}
                  />

                  {/* Glass step card — alternates sides on desktop. */}
                  <div className={isLeft ? "md:col-start-1 md:pr-4 md:text-right" : "md:col-start-2 md:pl-4"}>
                    <div className="group inline-block w-full rounded-2xl border border-white/12 bg-white/[0.04] p-5 text-left shadow-xl ring-1 ring-inset ring-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:ring-white/20 md:p-6">
                      {s.date && (
                        <span
                          className={`mb-2 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${isLeft ? "md:ml-auto" : ""}`}
                          style={{ color: accent, backgroundColor: `${accent}1f`, borderColor: `${accent}4d` }}
                        >
                          {s.date}
                        </span>
                      )}
                      <h3 className={`text-lg font-bold md:text-xl ${isLeft ? "md:text-right" : ""}`}>{s.title}</h3>
                      {s.text && <p className={`mt-2 leading-relaxed text-muted-foreground ${isLeft ? "md:text-right" : ""}`}>{s.text}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
