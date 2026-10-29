import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { aboutSchema } from "@hexapixora/contracts/blocks/about";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";
import { mediaAlt } from "../../lib/media-alt";

/** Image beside a heading, paragraphs, highlight cards and a button. */
export function AboutBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(aboutSchema, config);
  const headingId = useId();
  const image = safeHref(c.image);
  const highlights = c.highlights.filter((item) => item.title || item.description);
  const paragraphs = c.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <SectionFrame
      block="about"
      labelledBy={c.heading ? headingId : undefined}
      innerClassName={`grid items-center gap-12 ${image ? "lg:grid-cols-2 lg:gap-16" : ""}`}
    >
      {image ? (
        <ClipReveal className="relative aspect-[4/3] overflow-hidden border border-line lg:aspect-square">
          <img
            src={image}
            alt={mediaAlt(image, c.heading)}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </ClipReveal>
      ) : null}

      <div>
        {c.eyebrow ? <p className="mono mb-5 text-signal">{c.eyebrow}</p> : null}
        {c.heading ? (
          <h2 id={headingId} className="wide max-w-[20ch] text-display-md font-medium">
            {c.heading}
          </h2>
        ) : null}
        {paragraphs.length > 0 ? (
          <div className="mt-6 grid max-w-[60ch] gap-4 text-lg text-copy-dim">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {highlights.length > 0 ? (
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {highlights.map((item, i) => (
              <li key={i} className="bg-page p-6">
                {item.title ? <h3 className="wide mb-2 text-title font-medium">{item.title}</h3> : null}
                {item.description ? <p className="text-copy-dim">{item.description}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {c.buttonText ? (
          <div className="mt-10">
            <PillLink href={c.buttonUrl}>{c.buttonText}</PillLink>
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}
