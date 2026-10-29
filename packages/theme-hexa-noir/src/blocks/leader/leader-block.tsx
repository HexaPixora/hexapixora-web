import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { leaderSchema } from "@hexapixora/contracts/blocks/legacy/leader";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SectionFrame } from "../../components/section-frame";
import { StatGrid } from "../../components/stat-grid";
import { mediaAlt } from "../../lib/media-alt";

// The handwritten face is loaded by the app (next/font, not preloaded).
const SIGNATURE_FONT = "var(--font-signature), 'Segoe Script', cursive";

/**
 * A letter from the founder: portrait, pull quote, letter, signature and a
 * few numbers. The stored accent colour is ignored (the theme owns colour).
 */
export function LeaderBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(leaderSchema, config);
  const quoteId = useId();
  const portrait = safeHref(c.portrait);
  const stats = c.stats.filter((stat) => stat.value || stat.label);
  const paragraphs = c.letter
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <SectionFrame
      block="leader"
      labelledBy={c.kicker ? quoteId : undefined}
      innerClassName="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
    >
      <ClipReveal as="div" className="relative mx-auto w-full max-w-sm lg:mx-0">
        <figure>
          {/* Offset block behind the portrait, like a print frame. */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 bg-signal" />
          <div className="relative aspect-[4/5] overflow-hidden bg-page-raised">
            {portrait ? (
              <img
                src={portrait}
                alt={mediaAlt(portrait, c.name)}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden="true" className="wide grid h-full place-items-center text-display-lg text-copy/20">
                {(c.name || "H").charAt(0)}
              </span>
            )}
          </div>
          {c.portraitCaption ? (
            <figcaption className="mono relative mt-8 text-copy-dim">{c.portraitCaption}</figcaption>
          ) : null}
        </figure>
      </ClipReveal>

      <div>
        {c.kicker ? (
          <h2 id={quoteId} className="mono mb-6 flex items-center gap-3 text-copy-dim">
            <span aria-hidden="true" className="h-px w-9 bg-signal" />
            {c.kicker}
          </h2>
        ) : null}
        {c.quote ? (
          <blockquote className="font-display text-statement font-light">{c.quote}</blockquote>
        ) : null}
        {paragraphs.length > 0 ? (
          <div className="mt-7 grid max-w-[60ch] gap-4 text-copy-dim">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-9">
          {c.signature ? (
            <p aria-hidden="true" className="text-5xl leading-none text-signal md:text-6xl" style={{ fontFamily: SIGNATURE_FONT }}>
              {c.signature}
            </p>
          ) : null}
          <p className="mt-3">
            {c.name ? <span className="mono">{c.name}</span> : null}
            {c.title ? <span className="text-copy-dim"> — {c.title}</span> : null}
          </p>
        </div>

        {stats.length > 0 ? (
          <div className="mt-10">
            <StatGrid stats={stats} />
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}
