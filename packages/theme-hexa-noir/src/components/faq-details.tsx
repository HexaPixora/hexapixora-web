export type FaqEntry = { question: string; answer: string };

/**
 * Questions as native <details>: keyboard and screen-reader friendly, and
 * readable without JS. The plus/cross marker comes from blocks.css.
 */
export function FaqDetails({ items, className = "" }: { items: FaqEntry[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((item, i) => (
        <details key={i} data-part="faq-item" className="border-t border-line py-[22px] last:border-b">
          <summary className="flex cursor-pointer justify-between gap-5 text-question font-extrabold">
            <h3 className="font-extrabold">{item.question}</h3>
          </summary>
          <p className="mt-2.5 max-w-[64ch] whitespace-pre-line text-copy-dim">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** FAQPage structured data for the same questions. */
export function faqPageData(items: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
