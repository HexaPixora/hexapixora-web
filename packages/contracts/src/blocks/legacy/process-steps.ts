import { z } from 'zod';
import { defineBlock } from '../define-block';
import { chapterFields, chapterShape } from '../section-fields';

export const processStepsSchema = z.object({
  ...chapterShape,
  anchorId: z.string().default("process"),
  chapter: z.string().default("06"),
  heading: z.string().default("From idea to launch"),
  aside: z.string().default("One date"),
  steps: z.array(z.object({
    label: z.string().default(""),
    title: z.string().default(""),
    text: z.string().default(""),
  })).default([
    { label: "Step 01", title: "Discover", text: "Goals, pages and content, plus a fixed plan with a delivery date." },
    { label: "Step 02", title: "Design", text: "Clickable designs, reviewed together as we go." },
    { label: "Step 03", title: "Build", text: "Regular releases you can try on a private link." },
    { label: "Step 04", title: "Launch", text: "We ship on the agreed date and stay on for support." },
  ]),
  // *Stars* mark the highlighted words.
  promise: z.string().default("Every project delivered *on the agreed date*. Dates move only when the scope does."),
});

export type ProcessStepsProps = z.input<typeof processStepsSchema>;

export const ProcessStepsDef = defineBlock(
  'process-steps',
  "Process Steps",
  "Numbered steps on a line that draws itself, plus a promise sentence.",
  processStepsSchema,
  [
    ...chapterFields,
    {
      name: "steps", label: "Steps", type: "list", itemFields: [
        { name: "label", label: "Label", type: "text", placeholder: "Step 01" },
        { name: "title", label: "Title", type: "text" },
        { name: "text", label: "Text", type: "textarea" },
      ],
    },
    { name: "promise", label: "Promise", type: "textarea", description: "Wrap words in *stars* to highlight them." },
  ]
);
