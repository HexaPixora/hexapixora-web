import { safeHref } from "@hexapixora/contracts/links";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { mediaAlt } from "../../../lib/media-alt";
import type { WorkItem } from "../work-block";

/**
 * Project cards: image, categories and title. Projects have no page of their
 * own, so the cards are not links (no dead "#" links for search engines).
 */
export function GridWork({ items }: { items: WorkItem[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
      {items.map((item, i) => {
        const image = safeHref(item.image);
        const tags = item.tags
          .split("\n")
          .map((tag) => tag.trim())
          .filter(Boolean);
        return (
          <ClipReveal key={i} as="li" className="group">
            <div className="relative mb-5 aspect-[4/3] overflow-hidden border border-line bg-page-raised">
              {image ? (
                <img
                  src={image}
                  alt={mediaAlt(image, item.title)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              ) : (
                <span aria-hidden="true" className="wide grid h-full place-items-center text-display-md text-copy/10">
                  {item.title.charAt(0)}
                </span>
              )}
            </div>
            {tags.length > 0 ? (
              <p className="mono mb-2 flex flex-wrap gap-x-3 text-signal">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            ) : null}
            <h3 className="wide text-title font-medium">{item.title}</h3>
          </ClipReveal>
        );
      })}
    </ul>
  );
}
