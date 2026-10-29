import type { GalleryConfig } from "@hexapixora/contracts/blocks/gallery";
import { mediaAlt } from "../../../lib/media-alt";
import type { GalleryImage } from "../gallery-block";

const COLUMNS: Record<GalleryConfig["columns"], string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 md:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/** A grid of square images with optional captions underneath. */
export function GridGallery({ images, columns }: { images: GalleryImage[]; columns: GalleryConfig["columns"] }) {
  return (
    <ul className={`grid gap-4 ${COLUMNS[columns]}`}>
      {images.map((image, i) => (
        <li key={i}>
          <figure>
            <div className="aspect-square overflow-hidden border border-line bg-page-raised">
              <img
                src={image.src}
                alt={mediaAlt(image.src, image.title || `Gallery image ${i + 1}`)}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            {image.title ? <figcaption className="mono mt-3 text-copy-dim">{image.title}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
