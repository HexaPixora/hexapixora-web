import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { aboutSchema, AboutProps } from "@/lib/module-schemas/about-schema";

export default function AboutModule({ config }: { config?: AboutProps }) {
  const { eyebrow, heading, content, image, highlights, buttonText, buttonUrl } =
    aboutSchema.parse(config || {});
  const hl = (highlights || []).filter((h: any) => h.title || h.description);
  const paragraphs = (content || "").split("\n").map((p) => p.trim()).filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      {/* Ambient aurora */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-[40vh] w-[40vh] rounded-full bg-[rgba(16,147,253,0.12)] blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[36vh] w-[36vh] rounded-full bg-[rgba(80,60,220,0.12)] blur-[120px]" />

      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image — sharp photo under liquid-glass light. */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_40px_100px_-40px_rgba(16,147,253,0.5)] ring-1 ring-inset ring-white/10 md:aspect-[4/3] lg:aspect-square">
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={heading || "About us"} className="h-full w-full object-cover" />
                  <LiquidGlass tintClass="to-primary-blue/40" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-sm text-white/40">
                  Add an image in the builder
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-start">
            {eyebrow && (
              <span className="mb-6 inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
                {eyebrow}
              </span>
            )}

            <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-5xl">
              {heading || "Who we are"}
            </h2>

            {paragraphs.length > 0 && (
              <div className="prose prose-lg mt-6 max-w-none leading-relaxed text-muted-foreground dark:prose-invert">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {hl.length > 0 && (
              <div className="mt-8 grid w-full grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
                {hl.map((h: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-inset ring-white/10 transition-colors hover:border-white/20"
                  >
                    {h.title && <h4 className="mb-1 text-lg font-bold text-foreground">{h.title}</h4>}
                    {h.description && <p className="text-sm leading-relaxed text-muted-foreground">{h.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {buttonText && (
              <Link
                href={buttonUrl || "#"}
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2a9dff] to-[#1074e0] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(16,147,253,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(16,147,253,0.95)]"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
