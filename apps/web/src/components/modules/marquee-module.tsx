"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { marqueeSchema, MarqueeProps } from "@/lib/module-schemas/marquee-schema";

const SPEED: Record<string, number> = { slow: 40, normal: 24, fast: 12 };

export default function MarqueeModule({ config }: { config?: MarqueeProps }) {
  const { items, speed, direction } = marqueeSchema.parse(config || {});
  const list = (items || []).filter((i: any) => i.text || i.image);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track.current || list.length === 0) return;
    const ctx = gsap.context(() => {
      // The row is rendered twice; animating one full set (50%) loops seamlessly.
      const to = direction === "right" ? 0 : -50;
      const from = direction === "right" ? -50 : 0;
      gsap.fromTo(
        track.current,
        { xPercent: from },
        { xPercent: to, duration: SPEED[speed] ?? 24, ease: "none", repeat: -1 }
      );
    }, track);
    return () => ctx.revert();
  }, [list.length, speed, direction]);

  if (list.length === 0) {
    return (
      <section className="container py-16">
        <div className="border-2 border-dashed rounded-xl py-12 text-center text-muted-foreground">
          Add items to the Marquee in the CMS.
        </div>
      </section>
    );
  }

  const Item = ({ item }: { item: any }) =>
    item.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt={item.text || ""} className="h-10 md:h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
    ) : (
      <span className="text-3xl md:text-5xl font-bold tracking-tight text-foreground/80">{item.text}</span>
    );

  return (
    <section className="py-12 bg-muted/30 border-y overflow-hidden">
      {/* flex w-max so the track width = its content; rendered twice for the loop */}
      <div ref={track} className="flex w-max items-center gap-12 md:gap-16 will-change-transform">
        {[0, 1].map((dup) =>
          list.map((item: any, i: number) => (
            <div key={`${dup}-${i}`} className="flex items-center gap-12 md:gap-16 shrink-0" aria-hidden={dup === 1}>
              <Item item={item} />
              <span className="text-primary text-2xl">•</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
