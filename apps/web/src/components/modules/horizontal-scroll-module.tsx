"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { horizontalScrollSchema, HorizontalScrollProps } from "@/lib/module-schemas/horizontal-scroll-schema";

export default function HorizontalScrollModule({ config }: { config?: HorizontalScrollProps }) {
  const { heading, subheading, items } = horizontalScrollSchema.parse(config || {});
  const cards = (items || []).filter((i: any) => i.image || i.title);
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || !track.current || cards.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const amount = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      gsap.to(track.current, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${amount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, root);
    return () => ctx.revert();
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
      <div className="absolute top-0 inset-x-0 z-10 pt-12 px-6 text-center pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{heading}</h2>
        {subheading && <p className="mt-2 text-muted-foreground">{subheading}</p>}
      </div>

      <div ref={track} className="flex items-center gap-6 h-full pl-[6vw] pr-[6vw] will-change-transform">
        {cards.map((card: any, i: number) => {
          const inner = (
            <div className="relative w-[78vw] sm:w-[56vw] md:w-[40vw] lg:w-[30vw] h-[58vh] shrink-0 rounded-2xl overflow-hidden border bg-background shadow-sm group">
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
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
