import { safeHref } from "@hexapixora/contracts/links";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { Parallax } from "@hexapixora/motion/parallax";
import { filmLooks } from "../../../index";
import { Actions } from "../../../components/actions";
import { MediaImage } from "../../../components/media-image";
import { mediaAlt } from "../../../lib/media-alt";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

// Travel of the image layer (percent of its height) and the scrim strength.
const STRENGTH: Record<string, number> = { subtle: 5, medium: 9, strong: 12 };
const SCRIM: Record<string, number> = { none: 0, light: 0.3, medium: 0.55, dark: 0.75 };

/** Full-screen opener: a photo (drifting on scroll, if set) behind a centred headline. */
export function ImageHero({ c, titleId }: HeroLayoutProps) {
  const image = safeHref(c.image);
  const picture = image ? (
    <MediaImage src={image} alt={mediaAlt(image)} fill sizes="100vw" preload className="object-cover" />
  ) : null;

  return (
    <section
      data-block="hero"
      data-variant="image"
      data-media-hero={picture ? undefined : ""}
      aria-labelledby={titleId}
      // Over the fallback footage the text uses the on-media colour; a photo gets a page-coloured scrim.
      className={`relative isolate flex h-svh min-h-[600px] items-center justify-center overflow-hidden ${picture ? "" : "text-on-media"}`}
    >
      {picture && c.motion !== "none" ? (
        // The layer is 130% tall so its drift never shows an edge.
        <Parallax strength={STRENGTH[c.motion] ?? 9} className="absolute inset-x-0 top-[-15%] -z-20 h-[130%]">
          {picture}
        </Parallax>
      ) : picture ? (
        <div className="absolute inset-0 -z-20">{picture}</div>
      ) : (
        <FilmCanvas look={filmLooks.dusk} seed={9} className="absolute inset-0 -z-20 h-full w-full" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-page"
        style={{ opacity: SCRIM[c.overlay] ?? 0.55 }}
      />

      <div className="page-width text-center">
        {c.label ? <p className="mono mb-6 text-signal">{c.label}</p> : null}
        <HeroTitle
          id={titleId}
          className="wide mx-auto max-w-[18ch] text-display-hero font-medium"
          lines={headingLines(c.heading)}
        />
        {c.intro ? <p className="mx-auto mt-6 max-w-[52ch] text-lg md:text-xl">{c.intro}</p> : null}
        <Actions actions={c.actions} className="mt-9 justify-center" />
      </div>
    </section>
  );
}
