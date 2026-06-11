import React from "react";
import { faqsectionSchema, FAQProps } from "@/lib/module-schemas/faqsection-schema";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";



export default function FAQModule({ config }: { config?: FAQProps }) {
  const { heading, subheading, items } = faqsectionSchema.parse(config || {});
  const faqs = items || [];

  return (
    <section className="py-24 bg-muted/20 border-t">
      <div className="container max-w-[800px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>

        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full bg-background border rounded-xl shadow-sm px-6">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`} className={index === faqs.length - 1 ? 'border-none' : ''}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-background">
            No FAQs found. Add some in the CMS.
          </div>
        )}
      </div>
    </section>
  );
}
