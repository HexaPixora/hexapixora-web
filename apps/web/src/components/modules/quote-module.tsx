import React from "react";
import { quoteSchema, QuoteProps } from "@/lib/module-schemas/quote-schema";

// Same editorial serif as the Leader "Letter" module, so the two read as a set
// on the leadership page. Loaded once in the root layout as a CSS variable.
const SERIF = "var(--font-serif), Georgia, 'Times New Roman', serif";

export default function QuoteModule({ config }: { config?: QuoteProps }) {
  const c = quoteSchema.parse(config || {});
  const accent = c.accentColor || "#1093fd";

  return (
    <section className="relative isolate overflow-hidden bg-[#08080a] py-28 md:py-36">
      {/* Top spotlight cone — draws the eye to the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[52vh] w-[80vh] -translate-x-1/2 blur-[120px]"
        style={{ background: `radial-gradient(circle, ${accent}22, transparent 65%)` }}
      />

      <div className="container">
        <div className="relative mx-auto max-w-3xl">
          {/* Quote-mark medallion straddling the top edge of the card */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 backdrop-blur-xl md:h-20 md:w-20"
              style={{
                background: `linear-gradient(155deg, ${accent}, ${accent}99)`,
                boxShadow: `0 14px 40px -10px ${accent}88`,
              }}
            >
              {c.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  )}
            </div>
          </div>

          {/* Gradient-bordered glass card */}
          <div
            className="rounded-[2.2rem] bg-gradient-to-b from-white/15 to-white/[0.04] p-px"
            style={{ boxShadow: `0 50px 130px -50px rgba(0,0,0,0.85), 0 30px 90px -55px ${accent}66` }}
          >
            <div className="rounded-[calc(2.2rem-1px)] bg-[#0e0e12]/80 px-8 pb-10 pt-20 text-center backdrop-blur-2xl md:px-14 md:pb-14 md:pt-24">
              {c.eyebrow && (
                <p
                  className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: accent }}
                >
                  {c.eyebrow}
                </p>
              )}

              {c.quote && (
                <blockquote
                  style={{ fontFamily: SERIF }}
                  className="text-2xl font-normal leading-[1.35] text-white md:text-[2rem] md:leading-[1.3]"
                >
                  {c.quote}
                </blockquote>
              )}

              {/* Accent divider */}
              <div className="mx-auto mt-8 h-px w-14" style={{ backgroundColor: accent }} />

              {/* Author */}
              {(c.name || c.title || c.avatar) && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  
                  <div className="text-left">
                    {c.name && <div className="text-sm font-semibold text-white">{c.name}</div>}
                    {c.title && <div className="text-xs text-white/50">{c.title}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
