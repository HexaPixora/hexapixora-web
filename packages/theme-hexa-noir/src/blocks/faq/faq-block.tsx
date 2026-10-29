import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { faqsectionSchema } from "@hexapixora/contracts/blocks/faq";
import { FaqDetails, faqPageData } from "../../components/faq-details";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { jsonLd } from "../../lib/json-ld";

/** Questions and answers, plus FAQPage structured data for search engines. */
export function FaqBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(faqsectionSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="faq" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      <FaqDetails items={items} />
      <script
        type="application/ld+json"
        // Safe: serialised data, not CMS HTML; see jsonLd().
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageData(items)) }}
      />
    </SectionFrame>
  );
}
