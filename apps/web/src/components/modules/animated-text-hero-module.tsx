"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
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
      tl.from(".ath-word", { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.09 })
        .from(".ath-fade", { y: 20, opacity: 0, duration: 0.7, stagger: 0.15 }, "-=0.4");
    }, root);
    return () => ctx.revert();
  }, [heading]);

  return (
    <section ref={root} className="relative flex items-center justify-center min-h-[80vh] py-24 bg-background overflow-hidden">
      <div className="container max-w-4xl text-center">
        {eyebrow && (
          <p className="ath-fade inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]">
              <span className="ath-word inline-block">{w}</span>
            </span>
          ))}
        </h1>

        {subheading && <p className="ath-fade mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{subheading}</p>}

        {buttonText && buttonLink && (
          <div className="ath-fade mt-8">
            <Link href={buttonLink} className="inline-flex rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">
              {buttonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
