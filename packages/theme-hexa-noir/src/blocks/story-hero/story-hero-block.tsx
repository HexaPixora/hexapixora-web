import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { storyHeroSchema } from "@hexapixora/contracts/blocks/legacy/story-hero";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { mediaAlt } from "../../lib/media-alt";

/** Opener for the about page: label row, headline and intro, optionally over a photo. */
export function StoryHeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(storyHeroSchema, config);
  const titleId = useId();
  const image = safeHref(c.image);

  return (
    <section
      data-block="story-hero"
      data-variant={image ? "image" : "plain"}
      aria-labelledby={titleId}
      className={`relative isolate flex items-end overflow-hidden pb-section pt-[calc(var(--header-h)+80px)] ${image ? "min-h-[80vh]" : ""}`}
    >
      {image ? (
        <>
          <img
            src={image}
            alt={mediaAlt(image, c.heading)}
            fetchPriority="high"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/70 to-page/30" />
        </>
      ) : null}

      <div className="page-width">
        {c.eyebrow || c.foundedLabel ? (
          <p className="mono mb-6 flex flex-wrap gap-x-4 gap-y-1">
            {c.eyebrow ? <span className="text-signal">{c.eyebrow}</span> : null}
            {c.foundedLabel ? <span className="text-copy-dim">{c.foundedLabel}</span> : null}
          </p>
        ) : null}
        {c.heading ? (
          <HeroTitle id={titleId} className="wide max-w-[20ch] text-display-hero font-medium" lines={[{ text: c.heading }]} />
        ) : null}
        {c.intro ? <p className="mt-6 max-w-[60ch] text-lg text-copy-dim">{c.intro}</p> : null}
      </div>
    </section>
  );
}
