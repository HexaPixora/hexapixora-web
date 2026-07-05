"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollytellingSchema, ScrollytellingProps } from "@/lib/module-schemas/scrollytelling-schema";
import { LiquidGlass } from "@/components/ui/liquid-glass";

export default function ScrollytellingModule({ config }: { config?: ScrollytellingProps }) {
  const { heading, steps } = scrollytellingSchema.parse(config || {});
  const items = (steps || []).filter((s: any) => s.title || s.text || s.image);
  const root = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!root.current || items.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      stepEls.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    }, root);
    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) {
    return (
      <section className="container py-24">
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          Add steps to the Scrollytelling section in the CMS.
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="relative bg-background py-16 md:py-24">
      {heading && (
        <div className="container mb-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center">{heading}</h2>
        </div>
      )}

      <div className="container grid md:grid-cols-2 gap-10">
        {/* Sticky media (desktop) */}
        <div className="hidden md:block">
          <div className="sticky top-24 relative aspect-[1/1] rounded-2xl overflow-hidden shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]">
            {items.map((s: any, i: number) =>
              s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={s.image}
                  alt=""
                  className={`absolute inset-0 aspect-[1/1] p-4 object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
              ) : null
            )}
            <LiquidGlass tintClass="to-primary-blue/60" />
            <div className="absolute bottom-4 left-4 text-6xl font-bold text-white drop-shadow-lg">
              {String(active + 1).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          {items.map((s: any, i: number) => (
            <div
              key={i}
              ref={(el) => { stepEls.current[i] = el; }}
              className="min-h-[70vh] flex flex-col justify-center py-10"
            >
              {s.image && (
                <div className="md:hidden relative mb-6 overflow-hidden rounded-xl border border-white/15 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" className="w-full" />
                  <LiquidGlass tintClass="to-primary-blue/60" />
                </div>
              )}
              <h3 className="text-2xl md:text-4xl font-bold mb-4">{s.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
