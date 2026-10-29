import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { parallaxBannerSchema } from "@hexapixora/contracts/blocks/legacy/parallax-banner";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { Parallax } from "@hexapixora/motion/parallax";
import { filmLooks } from "../../index";
import { PillLink } from "../../components/pill-link";
import { mediaAlt } from "../../lib/media-alt";

// Travel of the image layer (percent of its height) and the scrim strength.
const STRENGTH: Record<string, number> = { subtle: 5, medium: 9, strong: 12 };
const SCRIM: Record<string, number> = { none: 0, light: 0.3, medium: 0.55, dark: 0.75 };

/** Full-screen opener: a photo that drifts behind a centred headline. */
export function ParallaxBannerBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(parallaxBannerSchema, config);
  const titleId = useId();
  const image = safeHref(c.image);

  return (
    <section
      data-block="parallax-banner"
      aria-labelledby={titleId}
      className="relative isolate flex h-svh min-h-[600px] items-center justify-center overflow-hidden"
    >
      {image ? (
        // The layer is 130% tall so its drift never shows an edge.
        <Parallax strength={STRENGTH[c.intensity] ?? 9} className="absolute inset-x-0 top-[-15%] -z-20 h-[130%]">
          <img src={image} alt={mediaAlt(image)} fetchPriority="high" className="h-full w-full object-cover" />
        </Parallax>
      ) : (
        <FilmCanvas look={filmLooks.dusk} seed={9} className="absolute inset-0 -z-20 h-full w-full" />
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-page" style={{ opacity: SCRIM[c.overlay] ?? 0.55 }} />

      <div className="page-width text-center">
        <HeroTitle id={titleId} className="wide mx-auto max-w-[18ch] text-display-hero font-medium" lines={[{ text: c.heading }]} />
        {c.subheading ? <p className="mx-auto mt-6 max-w-[52ch] text-lg md:text-xl">{c.subheading}</p> : null}
        {c.buttonText ? (
          <div className="mt-9">
            <PillLink href={c.buttonLink}>{c.buttonText}</PillLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
