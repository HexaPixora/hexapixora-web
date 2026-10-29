import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { filmHeroSchema } from "@hexapixora/contracts/blocks/film-hero";
import { Drift } from "@hexapixora/motion/drift";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { filmLooks } from "../../index";
import { PILL_CLASS, SafeLink } from "../../components/safe-link";

// Each tile drifts toward its own corner as the hero scrolls away.
const TILES = [
  { look: filmLooks.ember, x: -8, y: -8 },
  { look: filmLooks.flare, x: 8, y: -8 },
  { look: filmLooks.rust, x: -8, y: 8 },
  { look: filmLooks.brand, x: 8, y: 8 },
] as const;

/**
 * The page's opening: the <h1> (the LCP element, so it is plain text that
 * rises with CSS) over four decorative film tiles.
 */
export function FilmHeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(filmHeroSchema, config);
  const titleId = useId();

  return (
    <section
      data-block="film-hero"
      data-variant={c.variant}
      aria-labelledby={titleId}
      className="relative h-svh min-h-[640px] overflow-hidden"
    >
      {c.variant === "film" ? (
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
          <HeroTitle
            id={titleId}
            className="wide absolute inset-x-0 top-[30vh] text-display-lg font-medium"
            lines={[{ text: c.titleTop }, { text: c.titleBottom, className: "text-right" }]}
          />

          <div className="absolute bottom-[7vh] left-0 max-w-[38ch]">
            {c.subline ? <p className="text-lg font-semibold">{c.subline}</p> : null}
            {c.ctaText ? (
              <SafeLink
                href={c.ctaUrl}
                className={`${PILL_CLASS} mt-4 border border-copy px-5 py-3.5 text-sm hover:bg-copy hover:text-page`}
              >
                {c.ctaText} <span aria-hidden="true">→</span>
              </SafeLink>
            ) : null}
          </div>

          {c.scrollHint ? (
            <span aria-hidden="true" className="mono absolute bottom-[7vh] right-0">
              {c.scrollHint} ⋮
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
