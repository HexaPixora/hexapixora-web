"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parallaxBannerSchema, ParallaxBannerProps } from "@/lib/module-schemas/parallax-banner-schema";

const STRENGTH: Record<string, number> = { subtle: 10, medium: 20, strong: 35 };
const OVERLAY: Record<string, number> = { none: 0, light: 0.3, medium: 0.55, dark: 0.75 };

export default function ParallaxBannerModule({ config }: { config?: ParallaxBannerProps }) {
  const { image, heading, subheading, buttonText, buttonLink, intensity, overlay } =
    parallaxBannerSchema.parse(config || {});
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const strength = STRENGTH[intensity] ?? 20;

  useEffect(() => {
    if (!root.current || !bg.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg.current,
        { yPercent: -strength },
        {
          yPercent: strength,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [strength, image]);

  return (
    <section ref={root} className="relative h-[100vh] overflow-hidden flex items-center justify-center">
      <div ref={bg} className="absolute inset-x-0 h-[100%] will-change-transform">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-muted" />
        )}
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${OVERLAY[overlay] ?? 0.55})` }} />

      <div className="relative z-10 text-center text-white px-6 max-w-3xl">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow">{heading}</h2>
        {subheading && <p className="mt-4 text-lg md:text-xl text-white/85">{subheading}</p>}
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className="inline-flex mt-8 rounded-full bg-primary text-primary-foreground px-7 py-3 font-semibold hover:bg-primary/90 transition-colors"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
