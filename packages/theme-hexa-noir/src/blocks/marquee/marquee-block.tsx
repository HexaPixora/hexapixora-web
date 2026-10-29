import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { marqueeSchema } from "@hexapixora/contracts/blocks/marquee";
import { Marquee } from "@hexapixora/motion/marquee";
import { mediaAlt } from "../../lib/media-alt";

const DURATION: Record<string, number> = { slow: 50, normal: 32, fast: 18 };

/** A band of words (or logos) that slides endlessly, separated by slashes. */
export function MarqueeBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(marqueeSchema, config);
  const items = c.items.filter((item) => item.text || item.image);
  if (items.length === 0) return null;

  return (
    <section data-block="marquee" aria-label="Highlights" className="border-y border-line py-10 md:py-14">
      <Marquee duration={DURATION[c.speed] ?? 32} direction={c.direction === "right" ? "right" : "left"}>
        {items.map((item, i) => {
          const image = safeHref(item.image);
          return (
            <span key={i} className="flex items-center gap-12">
              {image ? (
                <img
                  src={image}
                  alt={mediaAlt(image, item.text)}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto object-contain opacity-70 grayscale md:h-12"
                />
              ) : (
                <span className="wide whitespace-nowrap text-display-md font-medium">{item.text}</span>
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
