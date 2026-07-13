import React from "react";
import { ArrowUpRight } from "lucide-react";
import { instagramReelsSchema, InstagramReelsProps } from "@/lib/module-schemas/instagram-reels-schema";

/** Inline Instagram glyph (lucide doesn't export one in this build). */
function IgIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Turn a reel/post URL (or bare shortcode) into its /embed iframe URL. */
function toEmbedUrl(raw: string): string | null {
  const s = (raw || "").trim();
  if (!s) return null;
  const m = s.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (m) {
    const type = m[1]!.toLowerCase() === "reels" ? "reel" : m[1]!.toLowerCase();
    return `https://www.instagram.com/${type}/${m[2]!}/embed`;
  }
  // Bare shortcode → assume a reel.
  if (/^[A-Za-z0-9_-]+$/.test(s)) return `https://www.instagram.com/reel/${s}/embed`;
  return null;
}

// Column count adapts to how many reels there are (max 4 in a row); with fewer,
// the grid narrows and centers so it never looks stranded.
const GRID_BY_COUNT: Record<number, string> = {
  1: "max-w-[340px] grid-cols-1",
  2: "max-w-2xl grid-cols-2",
  3: "max-w-4xl grid-cols-2 md:grid-cols-3",
  4: "max-w-6xl grid-cols-2 md:grid-cols-4",
};

export default function InstagramReelsModule({ config }: { config?: InstagramReelsProps }) {
  const { eyebrow, heading, subheading, reels, ctaLabel, ctaUrl } = instagramReelsSchema.parse(config || {});

  const embeds = (reels || [])
    .map((r) => toEmbedUrl(r.url))
    .filter((u): u is string => Boolean(u));

  const gridClass = GRID_BY_COUNT[Math.min(embeds.length, 4)] || GRID_BY_COUNT[4];

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[36vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.1)] blur-[120px]" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
              <IgIcon size={13} /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-5xl">
              {heading}
            </h2>
          )}
          {subheading && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{subheading}</p>}
        </div>

        {embeds.length > 0 ? (
          <div className={`mx-auto mt-14 grid gap-4 sm:gap-5 ${gridClass}`}>
            {embeds.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-black ring-1 ring-inset ring-white/10"
              >
                <iframe
                  src={src}
                  title={`Instagram reel ${i + 1}`}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  scrolling="no"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <IgIcon size={30} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm font-semibold text-foreground">No reels yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Add reel links in the module settings to display them here.</p>
          </div>
        )}

        {ctaLabel && ctaUrl && (
          <div className="mt-12 text-center">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[#7cc4ff]/40 hover:text-[#7cc4ff]"
            >
              <IgIcon size={16} /> {ctaLabel}
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
