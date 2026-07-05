"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { heroSchema, HeroProps } from "@/lib/module-schemas/hero-schema";

export default function HeroModule({ config }: { config?: HeroProps }) {
  const {
    heading,
    subheading,
    buttonText,
    buttonUrl,
    secondaryButtonText,
    secondaryButtonUrl,
    backgroundImage,
  } = heroSchema.parse(config || {});

  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(".hero-reveal", { opacity: 1, y: 0 });
        return;
      }
      gsap.set(".hero-reveal", { opacity: 0, y: 34 });
      gsap.to(".hero-reveal", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.08 });
    }, root);

    // Gentle aurora parallax on pointer move (desktop, non-reduced-motion).
    let teardown = () => {};
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root).map((el) => ({
        depth: parseFloat(el.dataset.depth || "0"),
        xTo: gsap.quickTo(el, "x", { duration: 1, ease: "power3" }),
        yTo: gsap.quickTo(el, "y", { duration: 1, ease: "power3" }),
      }));
      const onMove = (e: MouseEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(({ depth, xTo, yTo }) => { xTo(-nx * depth * 30); yTo(-ny * depth * 30); });
      };
      root.addEventListener("mousemove", onMove);
      teardown = () => root.removeEventListener("mousemove", onMove);
    }

    return () => { teardown(); ctx.revert(); };
  }, []);

  return (
    <section ref={rootRef} className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {/* Background image (kept sharp) with a gradient scrim so text stays readable. */}
      {backgroundImage && (
        <>
          <div aria-hidden className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </>
      )}

      {/* Ambient aurora glows (parallax layers). */}
      <div data-depth="0.8" aria-hidden className="pointer-events-none absolute -left-32 top-10 -z-10 h-[48vh] w-[48vh] rounded-full bg-[rgba(16,147,253,0.16)] blur-[120px]" />
      <div data-depth="1.2" aria-hidden className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[44vh] w-[44vh] rounded-full bg-[rgba(80,60,220,0.14)] blur-[130px]" />

      <div className="container relative z-10 grid w-full grid-cols-12 gap-6 py-24 md:py-32">
        <div className="col-span-12 flex flex-col items-start gap-6 lg:col-span-9 xl:col-span-8">
          <h1 className="hero-reveal bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-5xl font-black leading-[1.1] tracking-tight text-transparent sm:text-6xl lg:text-7xl xl:text-8xl">
            {heading}
          </h1>

          {subheading && (
            <p className="hero-reveal max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {subheading}
            </p>
          )}

          {(buttonText || secondaryButtonText) && (
            <div className="hero-reveal mt-4 flex flex-wrap items-center gap-3">
              {buttonText && (
                <a
                  href={buttonUrl}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-8 py-3.5 text-base font-semibold text-white shadow-[0_16px_38px_-12px_rgba(16,147,253,0.72)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_-12px_rgba(16,147,253,0.88)]"
                >
                  {buttonText}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              {secondaryButtonText && (
                <a
                  href={secondaryButtonUrl}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-8 py-3.5 text-base font-semibold text-white ring-1 ring-inset ring-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09]"
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
