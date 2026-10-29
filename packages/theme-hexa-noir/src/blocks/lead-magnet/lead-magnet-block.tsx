import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { leadMagnetSchema } from "@hexapixora/contracts/blocks/legacy/lead-magnet";
import { SectionFrame } from "../../components/section-frame";
import { mediaAlt } from "../../lib/media-alt";
import { LeadMagnetForm } from "./lead-magnet-form";

/**
 * A free download behind a short form. The copy renders on the server; only
 * the form is interactive. The stored background colour is ignored (the
 * theme owns colour).
 */
export function LeadMagnetBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(leadMagnetSchema, config);
  const titleId = useId();
  const cover = safeHref(c.coverImage);

  return (
    <SectionFrame block="lead-magnet" labelledBy={titleId} innerClassName="grid items-start gap-12 md:grid-cols-2">
      <div>
        {c.resourceTitle ? <p className="mono mb-5 text-signal">{c.resourceTitle}</p> : null}
        <h2 id={titleId} className="wide text-display-md font-medium">
          {c.heading}
        </h2>
        {c.subheading ? <p className="mt-5 max-w-[48ch] text-lg text-copy-dim">{c.subheading}</p> : null}
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
        buttonText={c.buttonText}
      />
    </SectionFrame>
  );
}
