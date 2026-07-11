import React from "react";
import { Sparkles } from "lucide-react";
import { ourProcessSchema, OurProcessProps } from "@/lib/module-schemas/our-process-schema";

export default function OurProcessModule({ config }: { config?: OurProcessProps }) {
  const { eyebrow, heading, subheading, steps } = ourProcessSchema.parse(config || {});
  const list = (steps || []).filter((s: any) => s.title || s.description);

  if (!heading && list.length === 0) return null;

  // Balance the grid: up to 4 across, but 3 when there are exactly 3/6 steps.
  const cols = list.length % 3 === 0 && list.length % 4 !== 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-25 -z-10 h-[36vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.1)] blur-[120px]" />

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

        {/* Steps */}
        {list.length > 0 && (
          <div className={`mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 ${cols}`}>
            {list.map((s: any, i: number) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-inset ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:ring-white/20 md:p-7"
              >
                {/* Corner glow on hover */}
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[rgba(16,147,253,0.18)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                {/* Step number */}
                <span className="bg-gradient-to-b from-[#7cc4ff] to-[#1074e0] bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {s.title && <h3 className="mt-4 text-lg font-bold text-foreground">{s.title}</h3>}
                {s.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
