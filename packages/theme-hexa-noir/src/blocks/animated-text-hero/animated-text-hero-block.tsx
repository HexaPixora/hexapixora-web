import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { animatedTextHeroSchema } from "@hexapixora/contracts/blocks/legacy/animated-text-hero";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { filmLooks } from "../../index";
import { PillLink } from "../../components/pill-link";

/** A centred page opener: label, headline that rises in, one line and a button. */
export function AnimatedTextHeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(animatedTextHeroSchema, config);
  const titleId = useId();

  return (
    <section
      data-block="animated-text-hero"
      aria-labelledby={titleId}
      className="relative isolate flex min-h-[80vh] items-center overflow-hidden pb-20 pt-[calc(var(--header-h)+48px)]"
    >
      <FilmCanvas look={filmLooks.brand} seed={8} className="absolute inset-0 -z-10 h-full w-full opacity-35" />
      <div className="page-width text-center">
        {c.eyebrow ? <p className="mono mb-6 text-signal">{c.eyebrow}</p> : null}
        <HeroTitle id={titleId} className="wide mx-auto max-w-[20ch] text-display-hero font-medium" lines={[{ text: c.heading }]} />
        {c.subheading ? <p className="mx-auto mt-6 max-w-[52ch] text-lg text-copy-dim md:text-xl">{c.subheading}</p> : null}
        {c.buttonText ? (
          <div className="mt-9">
            <PillLink href={c.buttonLink}>{c.buttonText}</PillLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
