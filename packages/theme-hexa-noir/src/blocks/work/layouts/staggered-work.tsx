import { safeHref } from "@hexapixora/contracts/links";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SafeLink } from "../../../components/safe-link";
import { mediaAlt } from "../../../lib/media-alt";
import type { WorkItem } from "../work-block";
import { MediaImage } from "../../../components/media-image";

/** Cards with an image, title and text that wipe in one after another. */
export function StaggeredWork({ items }: { items: WorkItem[] }) {
  return (
    <ul className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const image = safeHref(item.image);
        return (
          <ClipReveal
            key={i}
            as="li"
            className="group relative flex flex-col bg-page transition-colors duration-[400ms] hover:bg-page-raised"
          >
            {image ? (
              <div className="relative aspect-[16/10] overflow-hidden">
                <MediaImage
                  src={image}
                  alt={mediaAlt(image, item.title)}
                  fill
                  sizes="(min-width: 1440px) 460px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-7">
              {item.title ? (
                <h3 className="wide text-title font-medium">
                  {item.url ? (
                    // The whole card is clickable through the stretched link.
                    <SafeLink href={item.url} keepText className="after:absolute after:inset-0">
                      {item.title}
                    </SafeLink>
                  ) : (
                    item.title
                  )}
                </h3>
              ) : null}
              {item.text ? <p className="mt-2 text-copy-dim">{item.text}</p> : null}
            </div>
          </ClipReveal>
        );
      })}
    </ul>
  );
}
