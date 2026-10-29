import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { ctasectionSchema } from "@hexapixora/contracts/blocks/cta";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";

/**
 * A call-to-action band. The stored background colour is ignored: the theme
 * owns colour, so every theme pack restyles this band consistently.
 */
export function CtaBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(ctasectionSchema, config);
  const titleId = useId();

  return (
    <SectionFrame block="cta" labelledBy={titleId} innerClassName="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <ClipReveal>
        <h2 id={titleId} className="wide max-w-[16ch] text-display-md font-bold">
          {c.title}
        </h2>
        {c.subtitle ? <p className="mt-5 max-w-[48ch] text-lg text-copy-dim">{c.subtitle}</p> : null}
      </ClipReveal>
      {c.buttonText ? (
        <PillLink href={c.buttonUrl} size="lg" className="justify-self-start">
          {c.buttonText}
        </PillLink>
      ) : null}
    </SectionFrame>
  );
}
