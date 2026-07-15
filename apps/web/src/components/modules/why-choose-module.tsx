import React from "react";
import {
  Sparkles, Zap, ShieldCheck, Rocket, Award, Clock, Users, Heart,
  Target, TrendingUp, Code, Headphones, Palette, Gauge, Lightbulb, ThumbsUp,
} from "lucide-react";
import { whyChooseSchema, WhyChooseProps } from "@/lib/module-schemas/why-choose-schema";
import { Stagger, StaggerItem } from "@/components/public/motion";
import { Reveal } from "@/components/public/reveal";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  zap: Zap,
  shield: ShieldCheck,
  rocket: Rocket,
  award: Award,
  clock: Clock,
  users: Users,
  heart: Heart,
  target: Target,
  trending: TrendingUp,
  code: Code,
  support: Headphones,
  palette: Palette,
  gauge: Gauge,
  lightbulb: Lightbulb,
  thumbs: ThumbsUp,
};

export default function WhyChooseModule({ config }: { config?: WhyChooseProps }) {
  const { eyebrow, heading, subheading, items } = whyChooseSchema.parse(config || {});
  const list = (items || []).filter((i: any) => i.title || i.description);

  if (!heading && list.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      {/* Ambient brand-blue aurora. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-25 -z-10 h-[40vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.10)] blur-[120px]"
      />

      <div className="container">
        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            {eyebrow && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
                <Sparkles size={13} /> {eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-5xl">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subheading}</p>
            )}
          </div>
        </Reveal>

        {/* Reasons grid */}
        {list.length > 0 && (
          <Stagger className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item: any, i: number) => {
              const Icon = ICONS[item.icon] || Sparkles;
              return (
                <StaggerItem
                  key={i}
                  hoverLift
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-inset ring-white/10 transition-[box-shadow,border-color] duration-300 hover:border-white/20 hover:ring-white/20 md:p-7"
                >
                  {/* Corner glow on hover (CSS only). */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[rgba(16,147,253,0.18)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-b from-[#2a9dff]/25 to-[#1074e0]/10 text-[#7cc4ff] ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>

                  {item.title && <h3 className="text-lg font-bold text-foreground">{item.title}</h3>}
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  )}
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}
