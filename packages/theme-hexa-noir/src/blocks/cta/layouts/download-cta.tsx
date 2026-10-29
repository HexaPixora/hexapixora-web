import { safeHref } from "@hexapixora/contracts/links";
import { SectionFrame } from "../../../components/section-frame";
import { mediaAlt } from "../../../lib/media-alt";
import type { CtaLayoutProps } from "../cta-block";
import { LeadMagnetForm } from "./lead-magnet-form";

/**
 * A free download behind a short form. The copy renders on the server; only
 * the form is interactive.
 */
export function DownloadCta({ c, headingId }: CtaLayoutProps) {
  const cover = safeHref(c.image);

  return (
    <SectionFrame
      block="cta"
      variant="download"
      surface={c.surface}
      labelledBy={c.heading ? headingId : undefined}
      innerClassName="grid items-start gap-12 md:grid-cols-2"
    >
      <div>
        {c.label || c.resourceTitle ? <p className="mono mb-5 text-signal">{c.label || c.resourceTitle}</p> : null}
        {c.heading ? (
          <h2 id={headingId} className="wide whitespace-pre-line text-display-md font-medium">
            {c.heading}
          </h2>
        ) : null}
        {c.intro ? <p className="mt-5 max-w-[48ch] text-lg text-copy-dim">{c.intro}</p> : null}
        {cover ? (
          <img
            src={cover}
            alt={mediaAlt(cover, c.resourceTitle)}
            loading="lazy"
            decoding="async"
            className="mt-8 w-full max-w-xs border border-line"
          />
        ) : null}
      </div>
      <LeadMagnetForm
        resourceTitle={c.resourceTitle}
        resourceUrl={safeHref(c.resourceUrl) ?? ""}
        buttonText={c.submitLabel}
      />
    </SectionFrame>
  );
}
