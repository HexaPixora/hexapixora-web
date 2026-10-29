import { Drift } from "@hexapixora/motion/drift";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { filmLooks } from "../../../index";
import { PILL_CLASS, SafeLink } from "../../../components/safe-link";
import { headingLines, type HeroLayoutProps } from "../hero-layout";

// Each tile drifts toward its own corner as the hero scrolls away.
const TILES = [
  { look: filmLooks.ember, x: -8, y: -8 },
  { look: filmLooks.flare, x: 8, y: -8 },
  { look: filmLooks.rust, x: -8, y: 8 },
  { look: filmLooks.brand, x: 8, y: 8 },
] as const;

/**
 * Full-screen opener: the <h1> (the LCP element, so it is plain text that
 * rises with CSS) over four decorative film tiles. The last of several lines
 * sits on the right.
 */
export function FilmHero({ c, titleId }: HeroLayoutProps) {
  const lines = headingLines(c.heading).map((line, i, all) =>
    all.length > 1 && i === all.length - 1 ? { ...line, className: "text-right" } : line,
  );
  const actions = c.actions.filter((action) => action.label && action.url);

  return (
    <section
      data-block="hero"
      data-variant="film"
      data-media-hero=""
      aria-labelledby={titleId}
      className="relative h-svh min-h-[640px] overflow-hidden text-on-media"
    >
      {c.backdrop === "film" ? (
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {TILES.map((tile, i) => (
            <Drift key={i} x={tile.x} y={tile.y} className="relative overflow-hidden">
              <div data-part="film-tile" className="absolute inset-0">
                <FilmCanvas look={tile.look} seed={i} className="h-full w-full" />
              </div>
            </Drift>
          ))}
        </div>
      ) : null}

      {/* Copy sits in the page-width column; the tiles behind stay full-bleed. */}
      <div className="absolute inset-0 z-[3] page-width">
        <div className="relative h-full">
          {/* The label sits just above the title, clear of the copy at the bottom on short screens. */}
          {c.label ? <p className="mono absolute left-0 top-[calc(30vh-2.5rem)] text-signal">{c.label}</p> : null}
          <HeroTitle
            id={titleId}
            className="wide absolute inset-x-0 top-[30vh] text-display-lg font-medium"
            lines={lines}
          />

          <div className="absolute bottom-[7vh] left-0 max-w-[38ch]">
            {c.intro ? <p className="text-lg font-semibold">{c.intro}</p> : null}
            {actions.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {actions.map((action, i) => (
                  <SafeLink
                    key={i}
                    href={action.url}
                    className={`${PILL_CLASS} border border-on-media px-5 py-3.5 text-sm hover:bg-on-media/15`}
                  >
                    {action.label} <span aria-hidden="true">→</span>
                  </SafeLink>
                ))}
              </div>
            ) : null}
          </div>

          {c.note ? (
            <span aria-hidden="true" className="mono absolute bottom-[7vh] right-0">
              {c.note} ⋮
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
