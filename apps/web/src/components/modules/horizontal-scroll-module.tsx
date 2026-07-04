"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { horizontalScrollSchema, HorizontalScrollProps } from "@/lib/module-schemas/horizontal-scroll-schema";

export default function HorizontalScrollModule({ config }: { config?: HorizontalScrollProps }) {
  const { heading, subheading, aspectRatio, items } = horizontalScrollSchema.parse(config || {});
  const cards = (items || []).filter((i: any) => i.image || i.title);
  const aspectClass: Record<string, string> = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    wide: "aspect-[16/9]",
  };
  const ratio = aspectClass[aspectRatio] ?? "aspect-square";
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || cards.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Horizontal distance the track must travel = its overflow past the section.
      const distance = () => Math.max(0, tr.scrollWidth - el.offsetWidth);
      const tween = gsap.to(tr, { x: () => -distance(), ease: "none" });
      ScrollTrigger.create({
        animation: tween,
        trigger: el,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.6,
        invalidateOnRefresh: true,
      });
    }, el);

    // ScrollTrigger reads positions at creation time. On a dynamic page (images,
    // other lazily-mounted modules, the header overlay) the layout keeps shifting
    // afterwards, which mis-measures the pin start/end — so recalc once things
    // settle: after each image loads, after a short delay, and on window load.
    const refresh = () => ScrollTrigger.refresh();
    const imgs = Array.from(el.querySelectorAll("img"));
    let pending = imgs.filter((i) => !i.complete).length;
    if (pending === 0) refresh();
    else
      imgs.forEach((img) => {
        if (img.complete) return;
        const done = () => { if (--pending <= 0) refresh(); };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    const t = setTimeout(refresh, 500);
    window.addEventListener("load", refresh);

    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [cards.length]);

  if (cards.length === 0) {
    return (
      <section className="container py-24">
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          Add cards to the Horizontal Scroll Gallery in the CMS.
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="relative h-screen overflow-hidden bg-muted/30">
      <div className="absolute top-0 inset-x-0 z-10 py-16 px-6 text-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{heading}</h2>
        {subheading && <p className="mt-2 text-muted-foreground">{subheading}</p>}
      </div>

      <div ref={track} className="flex items-center gap-6 h-full px-[6vw] will-change-transform">
        {cards.map((card: any, i: number) => {
          const inner = (
            <div className={`relative h-[46vh] sm:h-[52vh] md:h-[58vh] ${ratio} rounded-md overflow-hidden`}>
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image} alt={card.title} className="absolute p-8 inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-blue/70 via-primary-blue/10 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                {card.subtitle && <p className="text-xs uppercase tracking-widest opacity-80 mb-1">{card.subtitle}</p>}
                <h3 className="text-2xl font-bold">{card.title}</h3>
              </div>
            </div>
          );
          return card.link ? (
            <Link key={i} href={card.link} className="shrink-0">{inner}</Link>
          ) : (
            <div key={i} className="shrink-0">{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
