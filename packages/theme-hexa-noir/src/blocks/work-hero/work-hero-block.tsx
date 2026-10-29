import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { workHeroSchema } from "@hexapixora/contracts/blocks/work-hero";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { PillLink } from "../../components/pill-link";
import { StatGrid } from "../../components/stat-grid";

/** Opener for the work page: headline, intro, a button and a row of stats. */
export function WorkHeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(workHeroSchema, config);
  const titleId = useId();
  const stats = c.stats.filter((stat) => stat.value || stat.label);

  return (
    <section
      data-block="work-hero"
      aria-labelledby={titleId}
      className="relative pb-section pt-[calc(var(--header-h)+80px)]"
    >
      <div className="page-width">
        {c.eyebrow ? <p className="mono mb-6 text-signal">{c.eyebrow}</p> : null}
        {c.heading ? (
          <HeroTitle id={titleId} className="wide max-w-[18ch] text-display-hero font-medium" lines={[{ text: c.heading }]} />
        ) : null}
        {c.subheading ? <p className="mt-6 max-w-[56ch] text-lg text-copy-dim">{c.subheading}</p> : null}
        {c.buttonText ? (
          <div className="mt-8">
            <PillLink href={c.buttonUrl}>{c.buttonText}</PillLink>
          </div>
        ) : null}

        {stats.length > 0 ? (
          <div className="mt-16">
            <StatGrid stats={stats} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
