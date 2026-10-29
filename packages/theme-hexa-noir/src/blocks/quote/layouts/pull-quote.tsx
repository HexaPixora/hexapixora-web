import { safeHref } from "@hexapixora/contracts/links";
import { WordLight } from "@hexapixora/motion/word-light";
import { SectionFrame } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { QuoteLayoutProps } from "../quote-block";

/** One large quote whose words light up while scrolling, with its author. */
export function PullQuote({ c, headingId }: QuoteLayoutProps) {
  const avatar = safeHref(c.image);
  if (!c.quote) return null;

  return (
    <SectionFrame block="quote" variant="pull" surface={c.surface} labelledBy={c.heading ? headingId : undefined}>
      <figure className="max-w-[28ch] md:max-w-[34ch]">
        {c.label ? <p className="mono mb-6 text-signal">{c.label}</p> : null}
        {c.heading ? (
          <h2 id={headingId} className="wide mb-8 text-title font-medium">
            {c.heading}
          </h2>
        ) : null}
        <blockquote>
          <WordLight text={`“${c.quote}”`} className="font-display text-statement font-light" />
        </blockquote>
        {c.name || c.role ? (
          <figcaption className="mt-10 flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={mediaAlt(avatar, c.name)}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true" className="h-px w-9 bg-signal" />
            )}
            <span>
              {c.name ? <span className="mono block">{c.name}</span> : null}
              {c.role ? <span className="text-copy-dim">{c.role}</span> : null}
            </span>
          </figcaption>
        ) : null}
      </figure>
    </SectionFrame>
  );
}
