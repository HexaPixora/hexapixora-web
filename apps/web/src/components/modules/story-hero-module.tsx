import React from "react";
import { Sparkles } from "lucide-react";
import { storyHeroSchema, StoryHeroProps } from "@/lib/module-schemas/story-hero-schema";

export default function StoryHeroModule({ config }: { config?: StoryHeroProps }) {
  const { eyebrow, heading, intro, foundedLabel, image } = storyHeroSchema.parse(config || {});
  const hasImage = Boolean(image);

  const pills = (eyebrow || foundedLabel) && (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10 backdrop-blur-md">
          <Sparkles size={13} /> {eyebrow}
        </span>
      )}
      {foundedLabel && (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md">
          {foundedLabel}
        </span>
      )}
    </div>
  );

  // Full-bleed background-image hero.
  if (hasImage) {
    return (
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={heading || "Our story"} className="absolute inset-0 h-full w-full object-cover" />
        {/* Readability overlays: bottom-up darkening + overall tint */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/35" />
        <div aria-hidden className="absolute inset-0 bg-[#08080a]/25" />
        {/* Subtle brand glow so it stays on-theme */}
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 h-[40vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.18)] blur-[130px]" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {pills}
            {heading && (
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] md:text-5xl lg:text-6xl">
                {heading}
              </h1>
            )}
            {intro && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
                {intro}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // No image — centered editorial layout with ambient aurora.
  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-25 -z-10 h-[46vh] w-[46vh] rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-20 -z-10 h-[40vh] w-[40vh] rounded-full bg-[rgba(80,60,220,0.12)] blur-[130px]" />

      <div className="container">
        <div className="mx-auto max-w-5xl text-center">
          {pills}
          {heading && (
            <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-5xl lg:text-6xl">
              {heading}
            </h1>
          )}
          {intro && (
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-muted-foreground">
              {intro}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
