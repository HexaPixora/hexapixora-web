import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { staggeredGridSchema } from "@hexapixora/contracts/blocks/staggered-grid";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";

/** Cards with an image, title and text that wipe in one after another. */
export function StaggeredGridBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(staggeredGridSchema, config);
  const headingId = useId();
  const cards = c.items.filter((card) => card.image || card.title || card.text);
  if (cards.length === 0) return null;

  return (
    <SectionFrame block="staggered-grid" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const image = safeHref(card.image);
          return (
            <ClipReveal key={i} as="li" className="group relative flex flex-col bg-page transition-colors duration-[400ms] hover:bg-page-raised">
              {image ? (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={image}
                    alt={mediaAlt(image, card.title)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-7">
                {card.title ? (
                  <h3 className="wide text-title font-medium">
                    {card.link ? (
                      // The whole card is clickable through the stretched link.
                      <SafeLink href={card.link} keepText className="after:absolute after:inset-0">
                        {card.title}
                      </SafeLink>
                    ) : (
                      card.title
                    )}
                  </h3>
                ) : null}
                {card.text ? <p className="mt-2 text-copy-dim">{card.text}</p> : null}
              </div>
            </ClipReveal>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
