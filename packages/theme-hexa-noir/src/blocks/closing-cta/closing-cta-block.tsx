import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { closingCtaSchema } from "@hexapixora/contracts/blocks/closing-cta";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { FilmCanvas } from "@hexapixora/motion/film-canvas";
import { filmLooks } from "../../index";
import { PILL_CLASS, SafeLink } from "../../components/safe-link";
import { SectionFrame } from "../../components/section-frame";

export function ClosingCtaBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(closingCtaSchema, config);
  const headingId = useId();

  return (
    <SectionFrame
      block="closing-cta"
      variant={c.variant}
      labelledBy={headingId}
      className="grid min-h-[90vh] content-center overflow-hidden text-center"
    >
      {c.variant === "film" ? (
        <FilmCanvas look={filmLooks.dusk} seed={5} className="absolute inset-0 h-full w-full opacity-55" />
      ) : null}
      <ClipReveal className="relative">
        <h2 id={headingId} className="wide text-display-xl font-bold">
          {c.titleTop}
          {c.titleBottom ? (
            <>
              <br />
              {c.titleBottom}
            </>
          ) : null}
        </h2>
      </ClipReveal>
      {c.text ? <p className="relative mx-auto mb-[30px] mt-6 max-w-[38ch] text-lg font-semibold">{c.text}</p> : null}
      {c.ctaText ? (
        <SafeLink
          href={c.ctaUrl}
          className={`${PILL_CLASS} relative justify-self-center bg-signal px-[30px] py-[18px] text-on-signal`}
        >
          {c.ctaText} <span aria-hidden="true">→</span>
        </SafeLink>
      ) : null}
    </SectionFrame>
  );
}
