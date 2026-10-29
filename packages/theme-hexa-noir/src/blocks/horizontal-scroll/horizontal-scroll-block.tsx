import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { horizontalScrollSchema } from "@hexapixora/contracts/blocks/horizontal-scroll";
import { SafeLink } from "../../components/safe-link";
import { mediaAlt } from "../../lib/media-alt";
import { PinnedTrack } from "./pinned-track";

const RATIO: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
};

/**
 * Cards that travel sideways while the section is pinned and the page
 * scrolls down. Without JavaScript or with reduced motion it is a normal
 * swipeable row; the cards are always in the HTML.
 */
export function HorizontalScrollBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(horizontalScrollSchema, config);
  const headingId = useId();
  const cards = c.items.filter((card) => card.image || card.title);
  if (cards.length === 0) return null;
  const ratio = RATIO[c.aspectRatio] ?? RATIO.square;

  return (
    <section
      data-block="horizontal-scroll"
      aria-labelledby={c.heading ? headingId : undefined}
      className="relative overflow-hidden border-t border-line"
    >
      <PinnedTrack
        header={
          c.heading || c.subheading ? (
            <div className="page-width pt-section">
              {c.heading ? (
                <h2 id={headingId} className="wide max-w-[20ch] text-display-md font-medium">
                  {c.heading}
                </h2>
              ) : null}
              {c.subheading ? <p className="mono mt-4 text-copy-dim">{c.subheading}</p> : null}
            </div>
          ) : null
        }
      >
        {cards.map((card, i) => {
          const image = safeHref(card.image);
          return (
            <article key={i} className={`group relative h-[50vh] shrink-0 overflow-hidden border border-line bg-page-raised ${ratio}`}>
              {image ? (
                <img
                  src={image}
                  alt={mediaAlt(image, card.title)}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-page/90 to-transparent p-5 pt-16">
                {card.subtitle ? <p className="mono text-signal">{card.subtitle}</p> : null}
                {card.title ? (
                  <h3 className="wide mt-1 text-title font-medium">
                    {card.link ? (
                      <SafeLink href={card.link} keepText className="after:absolute after:inset-0">
                        {card.title}
                      </SafeLink>
                    ) : (
                      card.title
                    )}
                  </h3>
                ) : null}
              </div>
            </article>
          );
        })}
      </PinnedTrack>
    </section>
  );
}
