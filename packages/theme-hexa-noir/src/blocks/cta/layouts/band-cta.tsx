import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { PillLink } from "../../../components/pill-link";
import { SectionFrame } from "../../../components/section-frame";
import type { CtaLayoutProps } from "../cta-block";

/** A band: heading and line on the left, large buttons on the right. */
export function BandCta({ c, headingId }: CtaLayoutProps) {
  const actions = c.actions.filter((action) => action.label && action.url);

  return (
    <SectionFrame
      block="cta"
      variant="band"
      surface={c.surface}
      labelledBy={c.heading ? headingId : undefined}
      innerClassName="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
    >
      <ClipReveal>
        {c.label ? <p className="mono mb-5 text-signal">{c.label}</p> : null}
        {c.heading ? (
          <h2 id={headingId} className="wide max-w-[16ch] whitespace-pre-line text-display-md font-medium">
            {c.heading}
          </h2>
        ) : null}
        {c.intro ? <p className="mt-5 max-w-[48ch] text-lg text-copy-dim">{c.intro}</p> : null}
      </ClipReveal>
      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-3 justify-self-start">
          {actions.map((action, i) => (
            <PillLink key={i} href={action.url} size="lg" variant={action.style === "secondary" ? "outline" : "solid"}>
              {action.label}
            </PillLink>
          ))}
        </div>
      ) : null}
    </SectionFrame>
  );
}
