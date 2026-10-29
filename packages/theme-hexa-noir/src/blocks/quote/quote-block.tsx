import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { quoteSchema } from "@hexapixora/contracts/blocks/legacy/quote";
import { WordLight } from "@hexapixora/motion/word-light";
import { SectionFrame } from "../../components/section-frame";
import { mediaAlt } from "../../lib/media-alt";

/**
 * One large quote whose words light up while scrolling, with its author.
 * The stored accent colour is ignored (the theme owns colour).
 */
export function QuoteBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(quoteSchema, config);
  const avatar = safeHref(c.avatar);
  if (!c.quote) return null;

  return (
    <SectionFrame block="quote">
      <figure className="max-w-[28ch] md:max-w-[34ch]">
        {c.eyebrow ? <p className="mono mb-6 text-signal">{c.eyebrow}</p> : null}
        <blockquote>
          <WordLight text={`“${c.quote}”`} className="font-display text-statement font-light" />
        </blockquote>
        {c.name || c.title ? (
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
              {c.title ? <span className="text-copy-dim">{c.title}</span> : null}
            </span>
          </figcaption>
        ) : null}
      </figure>
    </SectionFrame>
  );
}
