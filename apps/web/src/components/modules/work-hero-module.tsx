import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { workHeroSchema, WorkHeroProps } from "@/lib/module-schemas/work-hero-schema";

export default function WorkHeroModule({ config }: { config?: WorkHeroProps }) {
  const { eyebrow, heading, subheading, buttonText, buttonUrl, stats } = workHeroSchema.parse(config || {});
  const statList = (stats || []).filter((s: any) => s.value || s.label);

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28 lg:py-32">
      {/* Ambient aurora + subtle grid */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[46vh] w-[80vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.14)] blur-[130px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10 backdrop-blur-xl">
              <Sparkles size={13} /> {eyebrow}
            </span>
          )}
          {heading && (
            <h1 className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-4xl font-black leading-[1.08] tracking-tight text-transparent md:text-6xl lg:text-7xl">
              {heading}
            </h1>
          )}
          {subheading && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{subheading}</p>
          )}
          {buttonText && (
            <div className="mt-8">
              <a
                href={buttonUrl || "#"}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-8 py-3.5 text-base font-semibold text-white shadow-[0_16px_38px_-12px_rgba(16,147,253,0.72)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_-12px_rgba(16,147,253,0.88)]"
              >
                {buttonText}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          )}
        </div>

        {statList.length > 0 && (
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] ring-1 ring-inset ring-white/10 sm:grid-cols-4">
            {statList.map((s: any, i: number) => (
              <div key={i} className="bg-white/[0.02] px-5 py-7 text-center">
                <div className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-4xl">
                  {s.value}
                </div>
                {s.label && <div className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{s.label}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
