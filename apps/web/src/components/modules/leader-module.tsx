import React from "react";
import { leaderSchema, LeaderProps } from "@/lib/module-schemas/leader-schema";

// Display faces are loaded once in the root layout as CSS variables (so this
// stays a plain component that the client-side admin preview can import).
const SERIF = "var(--font-serif), Georgia, 'Times New Roman', serif";
const SCRIPT = "var(--font-signature), 'Segoe Script', cursive";

export default function LeaderModule({ config }: { config?: LeaderProps }) {
  const c = leaderSchema.parse(config || {});
  const accent = c.accentColor || "#1093fd";
  const paragraphs = (c.letter || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stats = (c.stats || []).filter((s) => s.value || s.label);

  return (
    <section className="relative isolate overflow-hidden bg-[#08080a] py-24 md:py-32">
      {/* Oversized editorial quotation watermark */}
      <span
        aria-hidden
        style={{ fontFamily: SERIF }}
        className="pointer-events-none absolute z-0 select-none text-[18rem] leading-none text-white/[0.035] md:left-10 md:text-[26rem]"
      >
        &ldquo;
      </span>
      {/* Single directional accent wash — not the site's glass aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(55% 55% at 12% 18%, ${accent}18, transparent 68%)` }}
      />

      <div className="container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
          {/* Portrait — offset print-style frame */}
          <figure className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div
              aria-hidden
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2px]"
              style={{ backgroundColor: accent }}
            />
            <div className="relative overflow-hidden rounded-[2px]">
              {c.portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.portrait}
                  alt={c.name}
                  className="aspect-[4/5] w-full object-cover grayscale-[12%] contrast-[1.03]"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950">
                  <span style={{ fontFamily: SERIF }} className="text-7xl text-white/20">
                    {(c.name || "H").charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {c.portraitCaption && (
              <figcaption className="mt-3 pl-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                {c.portraitCaption}
              </figcaption>
            )}
          </figure>

          {/* Content */}
          <div>
            {c.kicker && (
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-9" style={{ backgroundColor: accent }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  {c.kicker}
                </span>
              </div>
            )}

            {c.quote && (
              <blockquote
                style={{ fontFamily: SERIF }}
                className="text-[1.75rem] font-normal italic leading-[1.22] text-white md:text-[2.6rem] md:leading-[1.16]"
              >
                {c.quote}
              </blockquote>
            )}

            {paragraphs.length > 0 && (
              <div className="mt-7 space-y-4 text-base leading-relaxed text-white/60 md:max-w-xl">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* Signature block */}
            <div className="mt-9">
              {c.signature && (
                <p
                  style={{ fontFamily: SCRIPT, color: accent }}
                  className="text-5xl leading-none md:text-6xl"
                >
                  {c.signature}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                {c.name && (
                  <span className="text-sm font-semibold uppercase tracking-wider text-white">{c.name}</span>
                )}
                {c.title && <span className="text-sm text-white/45">— {c.title}</span>}
              </div>
            </div>

            {/* Credibility stats */}
            {stats.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-7">
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: SERIF }} className="text-2xl text-white md:text-[1.7rem]">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/45">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
