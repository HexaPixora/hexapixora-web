import { safeHref } from "@hexapixora/contracts/links";
import type { WorkConfig } from "@hexapixora/contracts/blocks/work";
import { SafeLink } from "../../../components/safe-link";
import { surfaceClass } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { WorkItem } from "../work-block";
import { PinnedTrack } from "./pinned-track";
import { MediaImage } from "../../../components/media-image";

const RATIO: Record<WorkConfig["ratio"], string> = {
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
export function ScrollWork({ c, items, headingId }: { c: WorkConfig; items: WorkItem[]; headingId: string }) {
  const ratio = RATIO[c.ratio];

  return (
    <section
      data-block="work"
      data-variant="scroll"
      aria-labelledby={c.heading ? headingId : undefined}
      className={`relative overflow-hidden border-t border-line ${surfaceClass(c.surface)}`}
    >
      <PinnedTrack
        header={
          c.label || c.heading || c.intro ? (
            <div className="page-width pt-section">
              {c.label ? <p className="mono mb-5 text-signal">{c.label}</p> : null}
              {c.heading ? (
                <h2 id={headingId} className="wide max-w-[20ch] whitespace-pre-line text-display-md font-medium">
                  {c.heading}
                </h2>
              ) : null}
              {c.intro ? <p className="mono mt-4 text-copy-dim">{c.intro}</p> : null}
            </div>
          ) : null
        }
      >
        {items.map((item, i) => {
          const image = safeHref(item.image);
          return (
            <article
              key={i}
              className={`group relative h-[50vh] shrink-0 overflow-hidden border border-line bg-page-raised ${ratio}`}
            >
              {image ? (
                <MediaImage
                  src={image}
                  alt={mediaAlt(image, item.title)}
                  fill
                  sizes="(min-width: 768px) 60vw, 90vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-page/90 to-transparent p-5 pt-16">
                {item.text ? <p className="mono text-signal">{item.text}</p> : null}
                {item.title ? (
                  <h3 className="wide mt-1 text-title font-medium">
                    {item.url ? (
                      <SafeLink href={item.url} keepText className="after:absolute after:inset-0">
                        {item.title}
                      </SafeLink>
                    ) : (
                      item.title
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
