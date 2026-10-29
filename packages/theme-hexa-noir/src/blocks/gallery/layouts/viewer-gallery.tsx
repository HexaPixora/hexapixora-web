import { mediaAlt } from "../../../lib/media-alt";
import type { GalleryImage } from "../gallery-block";
import { GalleryViewer } from "./gallery-viewer";

/** A large image with its caption and a row of thumbnails that pick it. */
export function ViewerGallery({ images }: { images: GalleryImage[] }) {
  const items = images.map((image) => ({
    src: image.src,
    alt: mediaAlt(image.src, image.title),
    title: image.title,
    description: image.text,
  }));
  return <GalleryViewer items={items} />;
}
