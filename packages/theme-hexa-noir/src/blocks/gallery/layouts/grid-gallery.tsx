import type { GalleryConfig } from "@hexapixora/contracts/blocks/gallery";
import { mediaAlt } from "../../../lib/media-alt";
import type { GalleryImage } from "../gallery-block";
import { MediaImage } from "../../../components/media-image";

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
            <div className="relative aspect-square overflow-hidden border border-line bg-page-raised">
              <MediaImage
                src={image.src}
                alt={mediaAlt(image.src, image.title || `Gallery image ${i + 1}`)}
                fill
                sizes="(min-width: 1440px) 450px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            {image.title ? <figcaption className="mono mt-3 text-copy-dim">{image.title}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
