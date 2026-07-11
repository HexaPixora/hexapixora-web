import React from "react";
import { Sparkles } from "lucide-react";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { storyHeroSchema, StoryHeroProps } from "@/lib/module-schemas/story-hero-schema";

export default function StoryHeroModule({ config }: { config?: StoryHeroProps }) {
  const { eyebrow, heading, intro, foundedLabel, image } = storyHeroSchema.parse(config || {});
  const hasImage = Boolean(image);

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-25 -z-10 h-[46vh] w-[46vh] rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-20 -z-10 h-[40vh] w-[40vh] rounded-full bg-[rgba(80,60,220,0.12)] blur-[130px]" />

      <div className="container">
        <div className={hasImage ? "grid items-center gap-12 lg:grid-cols-2 lg:gap-16" : "mx-auto max-w-5xl text-center"}>
          {/* Text */}
          <div className={hasImage ? "flex flex-col items-start" : "flex flex-col items-center"}>
            <div className={`mb-6 flex flex-wrap items-center gap-3 ${hasImage ? "" : "justify-center"}`}>
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
                  <Sparkles size={13} /> {eyebrow}
                </span>
              )}
              {foundedLabel && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {foundedLabel}
                </span>
              )}
            </div>

            {heading && (
              <h1 className={`bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-5xl lg:text-6xl ${hasImage ? "text-left" : ""}`}>
                {heading}
              </h1>
            )}
            {intro && (
              <p className={`mt-6 max-w-5xl text-lg leading-relaxed text-muted-foreground ${hasImage ? "" : "mx-auto"}`}>
                {intro}
              </p>
            )}
          </div>

          {/* Optional image */}
          {hasImage && (
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_40px_100px_-40px_rgba(16,147,253,0.5)] ring-1 ring-inset ring-white/10 lg:aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={heading || "Our story"} className="h-full w-full object-cover" />
                <LiquidGlass tintClass="to-primary-blue/40" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
