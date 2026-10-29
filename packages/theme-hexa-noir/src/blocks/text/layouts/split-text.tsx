import { safeHref } from "@hexapixora/contracts/links";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { Actions } from "../../../components/actions";
import { labelledBy } from "../../../components/block-head";
import { SectionFrame } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { TextLayoutProps } from "../text-block";

/** An image beside a heading, paragraphs, highlight cards and buttons. */
export function SplitText({ c, headingId }: TextLayoutProps) {
  const image = safeHref(c.image);
  const items = c.items.filter((item) => item.title || item.text);
  const paragraphs = c.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <SectionFrame
      block="text"
      variant="split"
      surface={c.surface}
      labelledBy={labelledBy(headingId, c)}
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
        {c.label ? <p className="mono mb-5 text-signal">{c.label}</p> : null}
        {c.heading ? (
          <h2 id={headingId} className="wide max-w-[20ch] whitespace-pre-line text-display-md font-medium">
            {c.heading}
          </h2>
        ) : null}
        {c.intro || paragraphs.length > 0 ? (
          <div className="mt-6 grid max-w-[60ch] gap-4 text-lg text-copy-dim">
            {c.intro ? <p className="text-copy">{c.intro}</p> : null}
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {items.map((item, i) => (
              <li key={i} className="bg-page p-6">
                {item.title ? <h3 className="wide mb-2 text-title font-medium">{item.title}</h3> : null}
                {item.text ? <p className="text-copy-dim">{item.text}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}

        <Actions actions={c.actions} className="mt-10" />
      </div>
    </SectionFrame>
  );
}
