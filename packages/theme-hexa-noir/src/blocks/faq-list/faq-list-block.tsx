import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { faqListSchema } from "@hexapixora/contracts/blocks/faq-list";
import { ChapterHeading } from "../../components/chapter-heading";
import { SectionFrame } from "../../components/section-frame";
import { jsonLd } from "../../lib/json-ld";

/** Native <details>: keyboard and screen-reader friendly, and readable without JS. */
export function FaqListBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(faqListSchema, config);
  const headingId = useId();
  const items = c.items.filter((item) => item.question && item.answer);
  if (items.length === 0) return null;

  return (
    <SectionFrame block="faq-list" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      {items.map((item, i) => (
        <details key={i} data-part="faq-item" className="border-t border-line py-[22px]">
          <summary className="flex cursor-pointer justify-between gap-5 text-question font-extrabold">
            <h3 className="font-extrabold">{item.question}</h3>
          </summary>
          <p className="mt-2.5 max-w-[64ch] text-copy-dim">{item.answer}</p>
        </details>
      ))}
      {c.structuredData ? (
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
      ) : null}
    </SectionFrame>
  );
}
