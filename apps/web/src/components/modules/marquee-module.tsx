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
      <section className="w-full py-16">
        <div className="border-2 border-dashed rounded-xl py-12 text-center text-muted-foreground">
          Add items to the Marquee in the CMS.
        </div>
      </section>
    );
  }

  const Item = ({ item }: { item: any }) =>
    item.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image}
        alt={item.text || ""}
        className="h-9 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-12"
      />
    ) : (
      <span className="bg-gradient-to-b from-white to-white/45 bg-clip-text text-3xl font-bold leading-[1.4] tracking-normal text-transparent md:text-5xl">
        {item.text}
      </span>
    );

  return (
    <section className="relative isolate py-10 md:py-14">
      {/* Ambient blue light behind the glass sheet (shows through the translucent panel for depth). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-[min(92%,66rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(16,147,253,0.22)] blur-[90px]"
      />

      <div className="w-full">
        {/* Floating blue liquid-glass panel — translucency + layered light + soft
            blue shadow (no heavy blur, so the marquee stays crisp & readable). */}
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-[rgba(16,147,253,0.14)] via-[rgba(16,147,253,0.05)] to-[rgba(16,147,253,0.12)] py-8 shadow-[0_24px_60px_-24px_rgba(16,147,253,0.5)] md:py-10">
          {/* Light layers behind the content (-z-10) so they never wash out the text. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/12 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(118deg,transparent_42%,rgba(255,255,255,0.10)_50%,transparent_58%)]" />
          <div aria-hidden className="glass-sheen pointer-events-none absolute -inset-y-1/4 -left-1/4 -z-10 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] [animation:glassSheen_9s_ease-in-out_infinite]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_0_0_1px_rgba(255,255,255,0.05)]" />

          {/* Content — edge-masked so items dissolve at the panel sides. */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
            <div ref={track} className="flex w-max items-center gap-10 will-change-transform md:gap-16">
              {[0, 1].map((dup) =>
                list.map((item: any, i: number) => (
                  <div key={`${dup}-${i}`} className="flex shrink-0 items-center gap-10 md:gap-16" aria-hidden={dup === 1}>
                    <Item item={item} />
                    {/* Glowing brand-blue separator. */}
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1093fd] shadow-[0_0_10px_1px_rgba(16,147,253,0.6)]"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
