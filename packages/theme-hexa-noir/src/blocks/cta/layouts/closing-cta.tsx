import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { filmLooks } from "../../../index";
import { PILL_CLASS, SafeLink } from "../../../components/safe-link";
import { SectionFrame } from "../../../components/section-frame";
import type { CtaLayoutProps } from "../cta-block";

/** The page's closing: a huge centred heading over moving film, one line and the buttons. */
export function ClosingCta({ c, headingId }: CtaLayoutProps) {
  const actions = c.actions.filter((action) => action.label && action.url);

  return (
    <SectionFrame
      block="cta"
      variant="closing"
      surface={c.surface}
      labelledBy={c.heading ? headingId : undefined}
      className="grid min-h-[90vh] content-center overflow-hidden"
      innerClassName="grid text-center"
      backdrop={
        c.backdrop === "film" ? (
          <FilmCanvas look={filmLooks.dusk} seed={5} className="absolute inset-0 h-full w-full opacity-55" />
        ) : null
      }
    >
      {c.heading ? (
        <ClipReveal className="relative">
          <h2 id={headingId} className="wide whitespace-pre-line text-display-xl font-bold">
            {c.heading}
          </h2>
        </ClipReveal>
      ) : null}
      {c.intro ? <p className="relative mx-auto mb-[30px] mt-6 max-w-[38ch] text-lg font-semibold">{c.intro}</p> : null}
      {actions.length > 0 ? (
        <div className="relative flex flex-wrap justify-center gap-3">
          {actions.map((action, i) => (
            <SafeLink
              key={i}
              href={action.url}
              className={`${PILL_CLASS} px-[30px] py-[18px] ${
                action.style === "secondary" ? "border border-copy hover:bg-copy hover:text-page" : "bg-signal text-on-signal"
              }`}
            >
              {action.label} <span aria-hidden="true">→</span>
            </SafeLink>
          ))}
        </div>
      ) : null}
    </SectionFrame>
  );
}
