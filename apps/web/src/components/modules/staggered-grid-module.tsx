"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { staggeredGridSchema, StaggeredGridProps } from "@/lib/module-schemas/staggered-grid-schema";

export default function StaggeredGridModule({ config }: { config?: StaggeredGridProps }) {
  const { heading, subheading, items } = staggeredGridSchema.parse(config || {});
  const cards = (items || []).filter((i: any) => i.image || i.title || i.text);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || cards.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".sg-card");
      if (!items.length) return;
      // Explicit start state + animate TO visible on enter (more reliable than
      // gsap.from, which can leave cards stuck hidden across ScrollTrigger refreshes).
      gsap.set(items, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        once: true,
        onEnter: () =>
          gsap.to(items, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.12, overwrite: true }),
      });
    }, el);

    // Recalculate once images load / the page settles so the trigger fires correctly.
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
    const t = setTimeout(refresh, 400);

    return () => { clearTimeout(t); ctx.revert(); };
  }, [cards.length]);

  if (cards.length === 0) {
    return (
      <section className="container py-24">
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          Add cards to the Staggered Grid in the CMS.
        </div>
      </section>
    );
  }

  return (
    <section ref={root} className="py-20 md:py-28 bg-background">
      <div className="container">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-14">
            {heading && <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{heading}</h2>}
            {subheading && <p className="mt-3 text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card: any, i: number) => {
            const inner = (
              <div className="sg-card group h-full flex flex-col bg-background border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {card.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  {card.title && <h3 className="text-xl font-bold mb-2">{card.title}</h3>}
                  {card.text && <p className="text-muted-foreground line-clamp-3">{card.text}</p>}
                </div>
              </div>
            );
            return card.link ? (
              <Link key={i} href={card.link} className="block h-full">{inner}</Link>
            ) : (
              <div key={i} className="h-full">{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
