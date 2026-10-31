import { safeHref } from "@hexapixora/contracts/links";
import { Marquee } from "@hexapixora/motion/marquee";
import { surfaceClass } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { TickerLayoutProps } from "../ticker-block";
import { MediaImage } from "../../../components/media-image";

/** Seconds per loop. */
const DURATION = { slow: 60, normal: 40, fast: 24 } as const;

/** Client or partner logos under a small label; names stand in for missing logos. */
export function LogosTicker({ c, items, headingId }: TickerLayoutProps) {
  return (
    <section
      data-block="ticker"
      data-variant="logos"
      aria-labelledby={c.heading ? headingId : undefined}
      className={`border-y border-line py-12 ${surfaceClass(c.surface)}`}
    >
      {c.heading ? (
        <h2 id={headingId} className="mono page-width mb-8 text-copy-dim">
          {c.heading}
        </h2>
      ) : null}
      <Marquee duration={DURATION[c.speed]} direction={c.direction} gapClassName="gap-16">
        {items.map((item, i) => {
          const image = safeHref(item.image);
          return image ? (
            <MediaImage
              key={i}
              src={image}
              alt={mediaAlt(image, item.title || `Partner logo ${i + 1}`)}
              sizes="140px"
              className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span key={i} className="wide whitespace-nowrap text-title font-medium text-copy-dim">
              {item.title}
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
