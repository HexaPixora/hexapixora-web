import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { splideSliderSchema } from "@hexapixora/contracts/blocks/legacy/slider";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { SnapCarousel } from "../../components/snap-carousel";

/**
 * Full-width slides with a title, text and button, swiped or stepped with
 * the arrows. Slides never move on their own (WCAG 2.2.2), so the stored
 * autoplay, interval and speed settings no longer apply.
 */
export function SliderBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(splideSliderSchema, config);
  const headingId = useId();
  const slides = c.items.filter((slide) => slide.title || slide.image);
  if (slides.length === 0) return null;

  return (
    <SectionFrame block="slider" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <SnapCarousel label={c.heading || "Slides"}>
        {slides.map((slide, i) => {
          const image = safeHref(slide.image);
          return (
            <article
              key={i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className="relative isolate flex min-h-[460px] w-full shrink-0 snap-start flex-col justify-end overflow-hidden border border-line bg-page-raised p-8 md:min-h-[540px] md:p-14"
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 -z-20 h-full w-full object-cover"
                  />
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/60 to-page/10" />
                </>
              ) : null}
              <span className="mono mb-auto text-signal">
                {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              {slide.title ? <h3 className="wide max-w-[18ch] text-display-md font-medium">{slide.title}</h3> : null}
              {slide.description ? <p className="mt-4 max-w-[52ch] text-lg text-copy-dim">{slide.description}</p> : null}
              {slide.buttonText ? (
                <div className="mt-8">
                  <PillLink href={slide.buttonUrl}>{slide.buttonText}</PillLink>
                </div>
              ) : null}
            </article>
          );
        })}
      </SnapCarousel>
    </SectionFrame>
  );
}
