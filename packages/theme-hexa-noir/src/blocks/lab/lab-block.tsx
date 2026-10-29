import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { labSchema } from "@hexapixora/contracts/blocks/lab";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { filmLooks } from "../../index";
import { ChapterHeading } from "../../components/chapter-heading";
import { PILL_CLASS, SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";

/** A small decorative network of nodes for products without imagery. */
function NodeNetwork() {
  return (
    <svg
      data-part="nodes"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-x-0 top-10 h-[48%] w-full"
    >
      <line x1="70" y1="70" x2="200" y2="120" />
      <line x1="200" y1="120" x2="330" y2="60" />
      <line x1="200" y1="120" x2="290" y2="190" />
      <line x1="70" y1="70" x2="120" y2="180" />
      <line x1="120" y1="180" x2="290" y2="190" />
      <circle cx="70" cy="70" r="9" />
      <circle cx="200" cy="120" r="12" />
      <circle cx="330" cy="60" r="8" />
      <circle cx="120" cy="180" r="8" />
      <circle cx="290" cy="190" r="10" />
    </svg>
  );
}

export function LabBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(labSchema, config);
  const headingId = useId();
  if (c.items.length === 0) return null;

  return (
    <SectionFrame block="lab" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      <ul className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {c.items.map((item, i) => (
          <ClipReveal
            key={i}
            as="li"
            part="lab-card"
            className="relative flex min-h-[440px] flex-col justify-between overflow-hidden border border-line p-[30px] [container-type:inline-size]"
          >
            {item.visual === "film" ? (
              <FilmCanvas look={filmLooks.cobalt} seed={4 + i} className="absolute inset-0 h-full w-full opacity-90" />
            ) : (
              <NodeNetwork />
            )}
            <span className="mono relative z-[1]">{item.kind}</span>
            <article className="relative z-[1]">
              <h3 className="wide text-[clamp(2rem,11.5cqi,5rem)] font-bold leading-[0.9]">{item.title}</h3>
              {item.text ? <p className="mt-2.5 max-w-[34ch] font-semibold">{item.text}</p> : null}
              {item.linkText ? (
                <SafeLink
                  href={item.linkUrl}
                  className={`${PILL_CLASS} mt-[18px] bg-copy px-[18px] py-3 text-sm text-page`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path fill="currentColor" d="M4 2.5v19l17-9.5z" />
                  </svg>
                  {item.linkText}
                </SafeLink>
              ) : null}
              {item.progressLabel ? (
                <div className="mt-[18px] grid max-w-[280px] gap-1.5">
                  <span className="mono text-[11px] text-copy-dim">{item.progressLabel}</span>
                  <span
                    role="progressbar"
                    aria-label={item.progressLabel}
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="relative block h-1 overflow-hidden bg-line"
                  >
                    <span className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${item.progress}%` }} />
                  </span>
                </div>
              ) : null}
            </article>
          </ClipReveal>
        ))}
      </ul>
    </SectionFrame>
  );
}
