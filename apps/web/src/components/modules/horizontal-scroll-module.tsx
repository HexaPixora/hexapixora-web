"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { horizontalScrollSchema, HorizontalScrollProps } from "@/lib/module-schemas/horizontal-scroll-schema";
import { LiquidGlass } from "@/components/ui/liquid-glass";

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
    <section ref={root} className="relative isolate h-screen overflow-hidden ">
      {/* Soft brand-blue aurora for depth behind the glass cards. */}
      <div aria-hidden className="pointer-events-none absolute top-0 -z-10 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-primary-blue/15 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 px-6  text-center md:pt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">{heading}</h2>
        {subheading && <p className="mt-2 text-sm text-muted-foreground md:text-base">{subheading}</p>}
      </div>

      <div ref={track} className="flex h-full items-center gap-4 px-6 will-change-transform md:gap-6 md:px-[6vw]">
        {cards.map((card: any, i: number) => {
          const inner = (
            <div className={`group relative h-[40vh] md:h-[50vh] ${ratio} overflow-hidden rounded-3xl border border-white/20 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]`}>
              {/* Sharp image — NO blur over the photo. */}
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image} alt={card.title} className="absolute inset-0 h-full p-4 object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/40 to-white/[0.06]" />
              )}

              {/* Liquid-glass light layers (shared component; no blur over the photo). */}
              <LiquidGlass tintClass="to-primary-blue/60" />

              {/* Caption on the tinted base — a sibling of the light layers, so it
                  stays crisp on mobile. */}
              {(card.title || card.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {card.subtitle && <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-white/80 md:text-[11px]">{card.subtitle}</p>}
                  {card.title && <h3 className="text-lg font-bold text-white drop-shadow md:text-2xl">{card.title}</h3>}
                </div>
              )}
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
