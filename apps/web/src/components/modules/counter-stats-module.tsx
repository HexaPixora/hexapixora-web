"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { counterStatsSchema, CounterStatsProps } from "@/lib/module-schemas/counter-stats-schema";

export default function CounterStatsModule({ config }: { config?: CounterStatsProps }) {
  const { heading, subheading, stats } = counterStatsSchema.parse(config || {});
  const items = (stats || []).filter((s: any) => s.value || s.label);
  const root = useRef<HTMLElement>(null);
  const valueEls = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!root.current || items.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          items.forEach((s: any, i: number) => {
            const el = valueEls.current[i];
            if (!el) return;
            const target = parseFloat(String(s.value).replace(/[^0-9.]/g, "")) || 0;
            const decimals = String(s.value).includes(".") ? 1 : 0;
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 2,
              ease: "power1.out",
              onUpdate: () => {
                el.textContent = obj.v.toLocaleString(undefined, {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                }) + (s.suffix || "");
              },
            });
          });
        },
      });
    }, root);
    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section ref={root} className="py-20 md:py-28 bg-background">
      <div className="container">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-14">
            {heading && <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{heading}</h2>}
            {subheading && <p className="mt-3 text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((s: any, i: number) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
                <span ref={(el) => { valueEls.current[i] = el; }}>0{s.suffix || ""}</span>
              </div>
              {s.label && <p className="mt-2 text-sm md:text-base text-muted-foreground">{s.label}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
