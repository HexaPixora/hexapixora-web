import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { heroSchema } from "@hexapixora/contracts/blocks/hero";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { filmLooks } from "../../index";
import { PillLink } from "../../components/pill-link";
import { mediaAlt } from "../../lib/media-alt";

/** Opening headline with up to two buttons, over a photo or moving film. */
export function HeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(heroSchema, config);
  const titleId = useId();
  const image = safeHref(c.backgroundImage);

  return (
    <section
      data-block="hero"
      data-variant={image ? "image" : "film"}
      aria-labelledby={titleId}
      className="relative isolate flex min-h-[92vh] items-end overflow-hidden pb-[10vh] pt-[calc(var(--header-h)+6vh)]"
    >
      {image ? (
        <>
          {/* The page's opening image: loaded first, never lazily. */}
          <img
            src={image}
            alt={mediaAlt(image)}
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/70 to-page/30" />
        </>
      ) : (
        <FilmCanvas look={filmLooks.ember} seed={7} className="absolute inset-0 -z-10 h-full w-full opacity-40" />
      )}

      <div className="page-width">
        <HeroTitle id={titleId} className="wide max-w-[18ch] text-display-hero font-medium" lines={[{ text: c.heading }]} />
        {c.subheading ? <p className="mt-6 max-w-[52ch] text-lg text-copy-dim md:text-xl">{c.subheading}</p> : null}
        {c.buttonText || c.secondaryButtonText ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {c.buttonText ? <PillLink href={c.buttonUrl}>{c.buttonText}</PillLink> : null}
            {c.secondaryButtonText ? (
              <PillLink href={c.secondaryButtonUrl} variant="outline">
                {c.secondaryButtonText}
              </PillLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
