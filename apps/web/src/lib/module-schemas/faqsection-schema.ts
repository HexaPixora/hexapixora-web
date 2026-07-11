import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const faqsectionSchema = z.object({
  heading: z.string().default("Frequently Asked Questions"),
  subheading: z.string().default("Got questions? We have answers."),
  items: z.array(z.object({
      question: z.string().default(""),
      answer: z.string().default("")
    })).default([{"question":"What is your turnaround time?","answer":"Typically 2-4 weeks depending on the project scope."},{"question":"Do you provide ongoing support?","answer":"Yes, we offer maintenance plans for all our clients."}]),
  anchorId: z.string().default("faq"),
});

export type FAQProps = z.input<typeof faqsectionSchema>;

export const FAQSectionDef = createModuleDefinition(
  'FAQSection',
  "FAQ Accordion",
  "Displays FAQs.",
  faqsectionSchema,
  [
    {
        name: "heading",
        label: "Heading",
        type: "text"
    },
    {
        name: "subheading",
        label: "Subheading",
        type: "textarea"
    },
    {
        name: "items",
        label: "Questions & Answers",
        type: "list",
        itemFields: [
            {
                name: "question",
                label: "Question",
                type: "text"
            },
            {
                name: "answer",
                label: "Answer",
                type: "textarea"
            }
        ]
    },
    { name: "anchorId", label: "Anchor ID", type: "text", description: "For in-page links, e.g. link a button to #faq." }
]
);
