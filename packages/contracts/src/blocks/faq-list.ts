import { z } from 'zod';
import { defineBlock } from './define-block';
import { chapterFields, chapterShape } from './section-fields';

export const faqListSchema = z.object({
  ...chapterShape,
  anchorId: z.string().default("faq"),
  chapter: z.string().default("07"),
  heading: z.string().default("Questions"),
  aside: z.string().default("Straight answers"),
  items: z.array(z.object({
    question: z.string().default(""),
    answer: z.string().default(""),
  })).default([
    { question: "Is HexaPixora just one person?", answer: "One senior lead runs every project, joined by specialists the lead has worked with before. You get a studio's range with one accountable person." },
    { question: "Why can't I see your client work?", answer: "Our contracts keep it private. We share results, references on request, and our own Lab products." },
    { question: "Can you sign an NDA?", answer: "Yes, before the first call if needed. Most of our work is confidential." },
    { question: "How long does a project take?", answer: "It depends on the scope. We set a delivery date in the first week and keep it." },
    { question: "How much does it cost?", answer: "No fixed packages. After a free discovery call you get a fixed quote based on your requirements." },
  ]),
  // FAQPage structured data for search results. Use it on one FAQ per page.
  structuredData: z.boolean().default(true),
});

export type FaqListProps = z.input<typeof faqListSchema>;

export const FaqListDef = defineBlock(
  'faq-list',
  "FAQ List",
  "Questions that open on click, with FAQ structured data for search engines.",
  faqListSchema,
  [
    ...chapterFields,
    {
      name: "items", label: "Questions", type: "list", itemFields: [
        { name: "question", label: "Question", type: "text" },
        { name: "answer", label: "Answer", type: "textarea" },
      ],
    },
    { name: "structuredData", label: "Add FAQ structured data (search engines)", type: "boolean" },
  ]
);
