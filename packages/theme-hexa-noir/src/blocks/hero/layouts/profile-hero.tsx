import { safeHref } from "@hexapixora/contracts/links";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { Actions } from "../../../components/actions";
import { surfaceClass } from "../../../components/section-frame";
import { StatGrid } from "../../../components/stat-grid";
import { mediaAlt } from "../../../lib/media-alt";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

/** A personal opener: name, role, bio, tags, buttons, portrait and numbers. */
export function ProfileHero({ c, titleId }: HeroLayoutProps) {
  const image = safeHref(c.image);
  const tags = c.tags.filter((tag) => tag.label);
  const stats = c.stats.filter((stat) => stat.value || stat.label);
  const firstName = c.heading.trim().split(/\s/)[0] ?? "";

  return (
    <section
      data-block="hero"
      data-variant="profile"
      aria-labelledby={titleId}
      className={`relative isolate overflow-hidden pb-section pt-[calc(var(--header-h)+64px)] ${surfaceClass(c.surface)}`}
    >
      {/* The first name, huge and faint, behind everything. */}
      {firstName ? (
        <span
          aria-hidden="true"
          className="wide pointer-events-none absolute inset-x-0 bottom-0 -z-10 select-none overflow-hidden whitespace-nowrap text-center text-[19vw] font-bold leading-none text-copy/[0.05]"
        >
          {firstName}
        </span>
      ) : null}

      <div className="page-width grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          {c.note ? <p className="mono mb-6 text-copy-dim">● {c.note}</p> : null}
          <HeroTitle id={titleId} className="wide text-display-hero font-medium" lines={headingLines(c.heading)} />
          {c.label ? <p className="mt-4 text-xl font-semibold">{c.label}</p> : null}
          {c.intro ? <p className="mt-5 max-w-[56ch] text-lg text-copy-dim">{c.intro}</p> : null}

          {tags.length > 0 ? (
            <ul aria-label="Skills" className="mono mt-7 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <li key={i} className="border border-line px-3 py-1.5">
                  {tag.label}
                </li>
              ))}
            </ul>
          ) : null}

          <Actions actions={c.actions} className="mt-8" />
        </div>

        {image ? (
          <ClipReveal className="relative aspect-[4/5] overflow-hidden border border-line">
            <img
              src={image}
              alt={mediaAlt(image, c.heading)}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </ClipReveal>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <div className="page-width mt-16">
          <StatGrid stats={stats} />
        </div>
      ) : null}
    </section>
  );
}
