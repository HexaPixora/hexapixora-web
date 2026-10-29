import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { portfolioSchema } from "@hexapixora/contracts/blocks/portfolio";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { mediaAlt } from "../../lib/media-alt";

/**
 * Project cards: image, categories and title. Projects have no page of their
 * own, so the cards are not links (no dead "#" links for search engines).
 */
export function PortfolioBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(portfolioSchema, config);
  const headingId = useId();
  const projects = c.items.filter((project) => project.title || project.image);
  if (projects.length === 0) return null;

  return (
    <SectionFrame block="portfolio" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2">
        {projects.map((project, i) => {
          const image = safeHref(project.image);
          const categories = project.categories.length ? project.categories : project.category ? [project.category] : [];
          return (
            <ClipReveal key={i} as="li" className="group">
              <div className="relative mb-5 aspect-[4/3] overflow-hidden border border-line bg-page-raised">
                {image ? (
                  <img
                    src={image}
                    alt={mediaAlt(image, project.title)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                ) : (
                  <span aria-hidden="true" className="wide grid h-full place-items-center text-display-md text-copy/10">
                    {project.title.charAt(0)}
                  </span>
                )}
              </div>
              {categories.length > 0 ? (
                <p className="mono mb-2 flex flex-wrap gap-x-3 text-signal">
                  {categories.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </p>
              ) : null}
              <h3 className="wide text-title font-medium">{project.title}</h3>
            </ClipReveal>
          );
        })}
      </ul>
    </SectionFrame>
  );
}
