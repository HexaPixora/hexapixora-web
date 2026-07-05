"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { animatedTextHeroSchema, AnimatedTextHeroProps } from "@/lib/module-schemas/animated-text-hero-schema";

export default function AnimatedTextHeroModule({ config }: { config?: AnimatedTextHeroProps }) {
  const { eyebrow, heading, subheading, buttonText, buttonLink } = animatedTextHeroSchema.parse(config || {});
  const root = useRef<HTMLElement>(null);
  const words = (heading || "").split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".ath-word", { yPercent: 120, opacity: 0, duration: 0.85, stagger: 0.08 })
        .from(".ath-fade", { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, "-=0.5");
    }, root);
    return () => ctx.revert();
  }, [heading]);

  return (
    <section ref={root} className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden py-28">
      {/* Faint tech grid, masked to fade out at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_45%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_45%,black,transparent)]"
      />
      {/* Brand-blue aurora for atmosphere. */}
      <div aria-hidden className="pointer-events-none absolute top-[5%] left-[12%] -z-10 h-[55vh] w-[55vh] rounded-full bg-[rgba(16,147,253,0.16)] blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-[10%] right-[10%] -z-10 h-[35vh] w-[45vh] rounded-full bg-[rgba(16,147,253,0.10)] blur-[130px]" />

      <div className="container max-w-4xl text-center">
        {eyebrow && (
          <span className="ath-fade mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1093fd] shadow-[0_0_10px_2px_rgba(16,147,253,0.6)]" />
            {eyebrow}
          </span>
        )}

        <h1 className="text-4xl font-bold leading-[1.50] tracking-tight md:text-6xl lg:text-7xl">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
              <span className="ath-word inline-block bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent">
                {w}
              </span>
            </span>
          ))}
        </h1>

        {subheading && (
          <p className="ath-fade mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {subheading}
          </p>
        )}

        {buttonText && buttonLink && (
          <div className="ath-fade mt-9">
            <Link
              href={buttonLink}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105"
            >
              {buttonText}
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
