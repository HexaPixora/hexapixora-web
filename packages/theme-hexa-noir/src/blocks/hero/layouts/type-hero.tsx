import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { filmLooks } from "../../../index";
import { Actions } from "../../../components/actions";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

/** A centred opener: label, a headline that rises in, one line and buttons, over a faint film. */
export function TypeHero({ c, titleId }: HeroLayoutProps) {
  return (
    <section
      data-block="hero"
      data-variant="type"
      aria-labelledby={titleId}
      className="relative isolate flex min-h-[80vh] items-center overflow-hidden pb-20 pt-[calc(var(--header-h)+48px)]"
    >
      <FilmCanvas look={filmLooks.brand} seed={8} className="absolute inset-0 -z-10 h-full w-full opacity-35" />
      <div className="page-width text-center">
        {c.label ? <p className="mono mb-6 text-signal">{c.label}</p> : null}
        <HeroTitle
          id={titleId}
          className="wide mx-auto max-w-[20ch] text-display-hero font-medium"
          lines={headingLines(c.heading)}
        />
        {c.intro ? <p className="mx-auto mt-6 max-w-[52ch] text-lg text-copy-dim md:text-xl">{c.intro}</p> : null}
        <Actions actions={c.actions} className="mt-9 justify-center" />
      </div>
    </section>
  );
}
