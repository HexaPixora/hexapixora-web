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
      gsap.set(".stat-card", { opacity: 0, y: 28 });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(".stat-card", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, overwrite: true });
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
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(t); ctx.revert(); };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section ref={root} className="relative isolate overflow-hidden py-20 md:py-28">
      {/* Soft brand-blue aurora for depth. */}
      <div aria-hidden className="pointer-events-none absolute left-[20%] top-[20%] -z-10 h-[32vh] w-[50vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.10)] blur-[90px]" />

      <div className="container">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-14">
            {heading && <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{heading}</h2>}
            {subheading && <p className="mt-3 text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((s: any, i: number) => (
            <div
              key={i}
              className="stat-card group relative rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-center shadow-lg ring-1 ring-inset ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-white/25 md:p-8"
            >
              <div className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-4xl font-bold leading-[1.4] tracking-tight text-transparent md:text-6xl">
                <span ref={(el) => { valueEls.current[i] = el; }}>0{s.suffix || ""}</span>
              </div>
              {s.label && <p className="mt-2 text-sm text-muted-foreground md:text-base">{s.label}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
