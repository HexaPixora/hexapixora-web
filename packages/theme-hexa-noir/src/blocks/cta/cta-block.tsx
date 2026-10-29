import { useId, type ComponentType } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { ctaSchema, type CtaConfig } from "@hexapixora/contracts/blocks/cta";
import type { BlockProps } from "../../lib/block-props";
import { BandCta } from "./layouts/band-cta";
import { ClosingCta } from "./layouts/closing-cta";
import { DownloadCta } from "./layouts/download-cta";

export type CtaLayoutProps = { c: CtaConfig; headingId: string };

const LAYOUTS: Record<CtaConfig["layout"], ComponentType<CtaLayoutProps>> = {
  band: BandCta,
  closing: ClosingCta,
  download: DownloadCta,
};

/** A call to action: a band, a large closing film, or a free download behind a form. */
export function CtaBlock({ config }: BlockProps) {
  const c = parseBlockConfig(ctaSchema, config);
  const headingId = useId();
  const Layout = LAYOUTS[c.layout];
  return <Layout c={c} headingId={headingId} />;
}
