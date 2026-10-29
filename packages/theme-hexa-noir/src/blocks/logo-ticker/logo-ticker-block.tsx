import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { splideLogoTickerSchema } from "@hexapixora/contracts/blocks/logo-ticker";
import { Marquee } from "@hexapixora/motion/marquee";
import { mediaAlt } from "../../lib/media-alt";

/**
 * Partner logos sliding endlessly under a small label. The stored "speed"
 * scales the loop; "per page" no longer applies (logos keep their size).
 */
export function LogoTickerBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(splideLogoTickerSchema, config);
  const headingId = useId();
  const logos = c.logos.filter((logo) => logo.image || logo.name);
  if (logos.length === 0) return null;
  const speed = Math.min(4, Math.max(0.25, parseFloat(c.speed) || 1));

  return (
    <section
      data-block="logo-ticker"
      aria-labelledby={c.heading ? headingId : undefined}
      className="border-y border-line py-12"
    >
      {c.heading ? (
        <h2 id={headingId} className="mono page-width mb-8 text-copy-dim">
          {c.heading}
        </h2>
      ) : null}
      <Marquee duration={40 / speed} gapClassName="gap-16">
        {logos.map((logo, i) => {
          const image = safeHref(logo.image);
          return image ? (
            <img
              key={i}
              src={image}
              alt={mediaAlt(image, logo.name || `Partner logo ${i + 1}`)}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto max-w-[140px] object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span key={i} className="wide whitespace-nowrap text-title font-medium text-copy-dim">
              {logo.name}
            </span>
          );
        })}
      </Marquee>
    </section>
  );
}
