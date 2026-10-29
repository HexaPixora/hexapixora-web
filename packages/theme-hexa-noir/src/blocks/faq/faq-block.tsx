import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { faqsectionSchema } from "@hexapixora/contracts/blocks/faq";
import { SectionFrame } from "../../components/section-frame";
import { jsonLd } from "../../lib/json-ld";
import { SectionHeading } from "../../components/section-heading";

/**
 * Questions as native <details> (keyboard and screen-reader friendly,
 * readable without JS), plus FAQPage structured data for search engines.
 */
export function FaqBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(faqsectionSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="faq" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} subheading={c.subheading} />
      {items.map((item, i) => (
        <details key={i} data-part="faq-item" className="border-t border-line py-[22px] last:border-b">
          <summary className="flex cursor-pointer justify-between gap-5 text-question font-extrabold">
            <h3 className="font-extrabold">{item.question}</h3>
          </summary>
          <p className="mt-2.5 max-w-[64ch] whitespace-pre-line text-copy-dim">{item.answer}</p>
        </details>
      ))}
      <script
        type="application/ld+json"
        // Safe: serialised data, not CMS HTML; see jsonLd().
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
    </SectionFrame>
  );
}
