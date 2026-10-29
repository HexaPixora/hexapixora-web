import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { faqSchema } from "@hexapixora/contracts/blocks/faq";
import { BlockHead, labelledBy } from "../../components/block-head";
import { FaqDetails, faqPageData } from "../../components/faq-details";
import { SectionFrame } from "../../components/section-frame";
import type { BlockProps } from "../../lib/block-props";
import { jsonLd } from "../../lib/json-ld";

/** Questions and answers, plus FAQPage structured data for search engines. */
export function FaqBlock({ config }: BlockProps) {
  const c = parseBlockConfig(faqSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="faq" variant={c.layout} surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      <FaqDetails items={items} />
      {c.structuredData ? (
        <script
          type="application/ld+json"
          // Safe: serialised data, not CMS HTML; see jsonLd().
          dangerouslySetInnerHTML={{ __html: jsonLd(faqPageData(items)) }}
        />
      ) : null}
    </SectionFrame>
  );
}
