import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { faqListSchema } from "@hexapixora/contracts/blocks/faq-list";
import { ChapterHeading } from "../../components/chapter-heading";
import { FaqDetails, faqPageData } from "../../components/faq-details";
import { SectionFrame } from "../../components/section-frame";
import { jsonLd } from "../../lib/json-ld";

export function FaqListBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(faqListSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="faq-list" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
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
