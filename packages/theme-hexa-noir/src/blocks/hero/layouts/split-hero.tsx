import { safeHref } from "@hexapixora/contracts/links";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { Actions } from "../../../components/actions";
import { surfaceClass } from "../../../components/section-frame";
import { MediaImage } from "../../../components/media-image";
import { mediaAlt } from "../../../lib/media-alt";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

/** A story opener: label row, headline and intro, optionally over a photo. */
export function SplitHero({ c, titleId }: HeroLayoutProps) {
  const image = safeHref(c.image);

  return (
    <section
      data-block="hero"
      data-variant="split"
      aria-labelledby={titleId}
      className={`relative isolate flex items-end overflow-hidden pb-section pt-[calc(var(--header-h)+80px)] ${image ? "min-h-[80vh]" : surfaceClass(c.surface)}`}
    >
      {image ? (
        <>
          <MediaImage
            src={image}
            alt={mediaAlt(image, c.heading)}
            fill
            sizes="100vw"
            preload
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/70 to-page/30"
          />
        </>
      ) : null}

      <div className="page-width">
        {c.label || c.note ? (
          <p className="mono mb-6 flex flex-wrap gap-x-4 gap-y-1">
            {c.label ? <span className="text-signal">{c.label}</span> : null}
            {c.note ? <span className="text-copy-dim">{c.note}</span> : null}
          </p>
        ) : null}
        <HeroTitle
          id={titleId}
          className="wide max-w-[20ch] text-display-hero font-medium"
          lines={headingLines(c.heading)}
        />
        {c.intro ? <p className="mt-6 max-w-[60ch] text-lg text-copy-dim">{c.intro}</p> : null}
        <Actions actions={c.actions} className="mt-8" />
      </div>
    </section>
  );
}
