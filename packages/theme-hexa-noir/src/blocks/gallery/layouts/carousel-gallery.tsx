import { PillLink } from "../../../components/pill-link";
import { SnapCarousel } from "../../../components/snap-carousel";
import type { GalleryImage } from "../gallery-block";

/**
 * Full-width slides with a title, text and button, swiped or stepped with
 * the arrows. Slides never move on their own (WCAG 2.2.2).
 */
export function CarouselGallery({ images, label }: { images: GalleryImage[]; label: string }) {
  return (
    <SnapCarousel label={label}>
      {images.map((slide, i) => (
        <article
          key={i}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${images.length}`}
          className="relative isolate flex min-h-[460px] w-full shrink-0 snap-start flex-col justify-end overflow-hidden border border-line bg-page-raised p-8 md:min-h-[540px] md:p-14"
        >
          {slide.src ? (
            <>
              <img
                src={slide.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/60 to-page/10" />
            </>
          ) : null}
          <span className="mono mb-auto text-signal">
            {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          {slide.title ? <h3 className="wide max-w-[18ch] text-display-md font-medium">{slide.title}</h3> : null}
          {slide.text ? <p className="mt-4 max-w-[52ch] text-lg text-copy-dim">{slide.text}</p> : null}
          {slide.linkText ? (
            <div className="mt-8">
              <PillLink href={slide.url}>{slide.linkText}</PillLink>
            </div>
          ) : null}
        </article>
      ))}
    </SnapCarousel>
  );
}
