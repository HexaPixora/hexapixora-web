import React from "react";
import { Sparkles } from "lucide-react";
import { ourStorySchema, OurStoryProps } from "@/lib/module-schemas/our-story-schema";

export default function OurStoryModule({ config }: { config?: OurStoryProps }) {
  const { eyebrow, heading, subheading, milestones } = ourStorySchema.parse(config || {});
  const list = (milestones || []).filter((m: any) => m.title || m.description || m.year);

  if (!heading && list.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 -z-10 h-[40vh] w-[40vh] rounded-full bg-[rgba(16,147,253,0.1)] blur-[120px]" />

      <div className="container">
        {/* Header */}
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
          {subheading && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subheading}</p>}
        </div>

        {/* Journey */}
        {list.length > 0 && (
          <div className="relative mx-auto mt-16 max-w-2xl">
            {/* Vertical glowing line */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-4 left-[7px] top-2 w-px bg-gradient-to-b from-[#1093fd] via-white/10 to-transparent"
            />
            <div className="space-y-8">
              {list.map((m: any, i: number) => (
                <div key={i} className="relative pl-10">
                  {/* Dot on the line */}
                  <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-[#1093fd] shadow-[0_0_12px_2px_rgba(16,147,253,0.6)]" />

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-inset ring-white/10 transition-colors hover:border-white/20 md:p-6">
                    {m.year && (
                      <span className="mb-2 inline-block rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-0.5 text-xs font-semibold text-[#7cc4ff]">
                        {m.year}
                      </span>
                    )}
                    {m.title && <h3 className="text-lg font-bold text-foreground">{m.title}</h3>}
                    {m.description && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
