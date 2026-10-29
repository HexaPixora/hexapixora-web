import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { quoteSchema, type QuoteConfig } from "@hexapixora/contracts/blocks/quote";
import type { BlockProps } from "../../lib/block-props";
import { LetterQuote } from "./layouts/letter-quote";
import { PullQuote } from "./layouts/pull-quote";

export type QuoteLayoutProps = { c: QuoteConfig; headingId: string };

export function QuoteBlock({ config }: BlockProps) {
  const c = parseBlockConfig(quoteSchema, config);
  const headingId = useId();
  return c.layout === "letter" ? (
    <LetterQuote c={c} headingId={headingId} />
  ) : (
    <PullQuote c={c} headingId={headingId} />
  );
}
