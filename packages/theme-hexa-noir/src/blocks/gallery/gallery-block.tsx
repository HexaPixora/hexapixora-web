import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { gallerySchema, type GalleryConfig } from "@hexapixora/contracts/blocks/gallery";
import { BlockHead, labelledBy } from "../../components/block-head";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { CarouselGallery } from "./layouts/carousel-gallery";
import { GridGallery } from "./layouts/grid-gallery";
import { ViewerGallery } from "./layouts/viewer-gallery";

/** A gallery image with its checked source. */
export type GalleryImage = GalleryConfig["items"][number] & { src: string };

/** Images as a grid, a swipeable carousel, or a large viewer with thumbnails. */
export function GalleryBlock({ config }: BlockProps) {
  const c = parseBlockConfig(gallerySchema, config);
  const headingId = useId();
  const images: GalleryImage[] = c.items.flatMap((item) => {
    const src = safeHref(item.image) ?? "";
    // A carousel slide can be text only; the grid and viewer need a picture.
    return src || (c.layout === "carousel" && item.title) ? [{ ...item, src }] : [];
  });
  if (images.length === 0) return null;

  return (
    <SectionFrame block="gallery" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      {c.layout === "carousel" ? (
        <CarouselGallery images={images} label={c.heading || "Slides"} />
      ) : c.layout === "viewer" ? (
        <ViewerGallery images={images} />
      ) : (
        <GridGallery images={images} columns={c.columns} />
      )}
    </SectionFrame>
  );
}
