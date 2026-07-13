"use client";

import React, { useEffect } from "react";
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

/** Pull an Instagram permalink out of a URL, shortcode, or pasted embed code. */
function toPermalink(raw: string): string | null {
  const s = (raw || "").trim();
  if (!s) return null;
  const m = s.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (m) {
    const type = m[1]!.toLowerCase() === "reels" ? "reel" : m[1]!.toLowerCase();
    return `https://www.instagram.com/${type}/${m[2]!}/`;
  }
  if (/^[A-Za-z0-9_-]+$/.test(s)) return `https://www.instagram.com/reel/${s}/`;
  return null;
}

/**
 * Build the official Instagram embed blockquote for a reel. `embed.js` (loaded
 * once below) turns each blockquote into a correctly-sized iframe showing the
 * full reel — so nothing gets cropped.
 */
function blockquoteFor(raw: string): string | null {
  const s = (raw || "").trim();
  // Already a full embed code pasted from Instagram → use it, minus its inline
  // <script> (we load embed.js ourselves; an inert script tag would do nothing).
  if (/<blockquote[\s>]/i.test(s)) {
    return s.replace(/<script[\s\S]*?<\/script>/gi, "");
  }
  const permalink = toPermalink(s);
  if (!permalink) return null;
  return `<blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="background:#000; border:0; margin:0; padding:0; width:100%; min-width:0;"></blockquote>`;
}

export default function InstagramReelsModule({ config }: { config?: InstagramReelsProps }) {
  const { eyebrow, heading, subheading, reels, ctaLabel, ctaUrl } = instagramReelsSchema.parse(config || {});

  const items = (reels || [])
    .map((r) => blockquoteFor(r.url))
    .filter((h): h is string => Boolean(h));

  // Load Instagram's embed script once, then (re)process the blockquotes.
  const key = items.join("|");
  useEffect(() => {
    if (items.length === 0) return;
    const w = window as unknown as { instgrm?: { Embeds?: { process: () => void } } };
    const process = () => w.instgrm?.Embeds?.process();
    if (w.instgrm) {
      process();
      return;
    }
    const existing = document.getElementById("instagram-embed-js");
    if (existing) {
      const t = setInterval(() => {
        if (w.instgrm) {
          clearInterval(t);
          process();
        }
      }, 300);
      return () => clearInterval(t);
    }
    const script = document.createElement("script");
    script.id = "instagram-embed-js";
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    script.onload = process;
    document.body.appendChild(script);
  }, [key, items.length]);

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

        {items.length > 0 ? (
          // Fixed-width cards that wrap and center — up to 4 per row on wide
          // screens (container is capped), fewer rows auto-center.
          <div className="mx-auto mt-14 flex max-w-[1400px] flex-wrap justify-center gap-5">
            {items.map((html, i) => (
              <div
                key={i}
                className="w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black ring-1 ring-inset ring-white/10 sm:w-[326px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <IgIcon size={30} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm font-semibold text-foreground">No reels yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Add reel links (or embed codes) in the module settings.</p>
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
              <ArrowUpRight size={15} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
