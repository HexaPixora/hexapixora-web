import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { splideGallerySyncSchema } from "@hexapixora/contracts/blocks/gallery-sync";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";
import { GalleryViewer } from "./gallery-viewer";

/** A large image with captions and a row of thumbnails that pick it. */
export function GallerySyncBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(splideGallerySyncSchema, config);
  const headingId = useId();
  const items = c.items
    .map((item) => {
      const src = safeHref(item.image);
      return src ? { src, alt: mediaAlt(src, item.title), title: item.title, description: item.description } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="gallery-sync" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} />
      <GalleryViewer items={items} />
    </SectionFrame>
  );
}
