import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { gallerySchema } from "@hexapixora/contracts/blocks/gallery";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";

const COLUMNS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 md:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/** A grid of square images with optional captions underneath. */
export function GalleryBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(gallerySchema, config);
  const headingId = useId();
  const images = c.images
    .map((image) => ({ ...image, src: safeHref(image.url) }))
    .filter((image): image is typeof image & { src: string } => Boolean(image.src));
  if (images.length === 0) return null;

  return (
    <SectionFrame block="gallery" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} />
      <ul className={`grid gap-4 ${COLUMNS[c.columns] ?? COLUMNS["3"]}`}>
        {images.map((image, i) => (
          <li key={i}>
            <figure>
              <div className="aspect-square overflow-hidden border border-line bg-page-raised">
                <img
                  src={image.src}
                  alt={mediaAlt(image.src, image.caption || `Gallery image ${i + 1}`)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              {image.caption ? <figcaption className="mono mt-3 text-copy-dim">{image.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
