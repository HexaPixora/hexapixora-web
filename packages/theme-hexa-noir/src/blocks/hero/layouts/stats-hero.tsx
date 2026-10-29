import { HeroTitle } from "@hexapixora/motion/hero-title";
import { Actions } from "../../../components/actions";
import { surfaceClass } from "../../../components/section-frame";
import { StatGrid } from "../../../components/stat-grid";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

/** An opener with a headline, intro, buttons and a row of numbers. */
export function StatsHero({ c, titleId }: HeroLayoutProps) {
  const stats = c.stats.filter((stat) => stat.value || stat.label);

  return (
    <section
      data-block="hero"
      data-variant="stats"
      aria-labelledby={titleId}
      className={`relative pb-section pt-[calc(var(--header-h)+80px)] ${surfaceClass(c.surface)}`}
    >
      <div className="page-width">
        {c.label ? <p className="mono mb-6 text-signal">{c.label}</p> : null}
        <HeroTitle
          id={titleId}
          className="wide max-w-[18ch] text-display-hero font-medium"
          lines={headingLines(c.heading)}
        />
        {c.intro ? <p className="mt-6 max-w-[56ch] text-lg text-copy-dim">{c.intro}</p> : null}
        <Actions actions={c.actions} className="mt-8" />

        {stats.length > 0 ? (
          <div className="mt-16">
            <StatGrid stats={stats} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
