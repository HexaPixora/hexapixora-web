"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link2 } from "lucide-react";
import { teamSchema, TeamProps } from "@/lib/module-schemas/team-schema";
import { LiquidGlass } from "@/components/ui/liquid-glass";

export default function TeamModule({ config }: { config?: TeamProps }) {
  const { heading, subheading, items } = teamSchema.parse(config || {});
  const members = (items || []).filter((m: any) => m.name || m.image);
  const root = useRef<HTMLElement>(null);

  // Clean, intentional scroll-in: portraits rise + fade with a soft stagger.
  useEffect(() => {
    const el = root.current;
    if (!el || members.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".team-card");
      if (!cards.length) return;
      gsap.set(cards, { y: 48, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () =>
          gsap.to(cards, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, overwrite: true }),
      });
    }, el);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => { clearTimeout(t); ctx.revert(); };
  }, [members.length]);

  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-32">
      <div className="container">
        {/* Editorial split header */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">{heading}</h2>
            {subheading && (
              <p className="max-w-sm text-base text-muted-foreground md:text-right md:text-lg">{subheading}</p>
            )}
          </div>
          <div className="mt-8 h-px w-full bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
        </div>

        {members.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed py-16 text-center text-muted-foreground">
            No team members found. Add some in the CMS.
          </div>
        ) : (
          // Staggered editorial composition: on large screens the middle column
          // drops to break the grid rhythm; stacks cleanly on mobile.
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {members.map((member: any, idx: number) => (
              <article key={idx} className="team-card group relative lg:[&:nth-child(3n-1)]:mt-20">
                {/* Oversized index numeral — magazine accent behind the card. */}
                <span
                  aria-hidden
                  className="pointer-events-none z-12 absolute -left-1 -top-12 select-none text-7xl font-black leading-none text-primary-blue/[0.66]"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Tall portrait with the liquid-glass treatment. */}
                <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-3xl shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]">
                  {member.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.image}
                      alt={member.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.10]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-blue/30 to-white/[0.05] text-6xl font-bold text-white/40">
                      {member.name?.charAt(0) || "?"}
                    </div>
                  )}

                  <LiquidGlass tintClass="to-primary-blue/55" />

                  {/* Name / role / social on the tinted glass base (crisp — a
                      sibling of the light layers, not inside any blur). */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-xl font-bold text-white drop-shadow md:text-2xl">{member.name}</h3>
                    {member.role && <p className="mt-0.5 text-sm font-medium text-white/75">{member.role}</p>}
                    {member.linkedin && member.linkedin !== "#" && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white transition-all duration-300 hover:scale-110 hover:bg-white/30 focus-visible:opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                      >
                        <Link2 size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
