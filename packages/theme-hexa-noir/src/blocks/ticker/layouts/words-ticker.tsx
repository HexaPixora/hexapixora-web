import { safeHref } from "@hexapixora/contracts/links";
import { Marquee } from "@hexapixora/motion/marquee";
import { surfaceClass } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { TickerLayoutProps } from "../ticker-block";
import { MediaImage } from "../../../components/media-image";

/** Seconds per loop. */
const DURATION = { slow: 50, normal: 32, fast: 18 } as const;

/** Large words (or pictures) separated by slashes. */
export function WordsTicker({ c, items, headingId }: TickerLayoutProps) {
  return (
    <section
      data-block="ticker"
      data-variant="words"
      aria-labelledby={c.heading ? headingId : undefined}
      aria-label={c.heading ? undefined : "Highlights"}
      className={`border-y border-line py-10 md:py-14 ${surfaceClass(c.surface)}`}
    >
      {c.heading ? (
        <h2 id={headingId} className="mono page-width mb-8 text-copy-dim">
          {c.heading}
        </h2>
      ) : null}
      <Marquee duration={DURATION[c.speed]} direction={c.direction}>
        {items.map((item, i) => {
          const image = safeHref(item.image);
          return (
            <span key={i} className="flex items-center gap-12">
              {image ? (
                <MediaImage
                  src={image}
                  alt={mediaAlt(image, item.title)}
                  sizes="160px"
                  className="h-10 w-auto object-contain opacity-70 grayscale md:h-12"
                />
              ) : (
                <span className="wide whitespace-nowrap text-display-md font-medium">{item.title}</span>
              )}
              <span aria-hidden="true" className="font-display text-display-md text-signal">
                /
              </span>
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
