import { z } from 'zod';
import { defineBlock } from '../define-block';
import { chapterFields, chapterShape } from '../section-fields';

export const statementSchema = z.object({
  ...chapterShape,
  chapter: z.string().default("01"),
  heading: z.string().default("The studio"),
  aside: z.string().default("HexaPixora"),
  text: z.string().default("HexaPixora is one senior developer and a trusted crew of specialists. You talk to the same person from the first call to launch day. Behind them, designers, motion artists and engineers are chosen for your project, not for whoever happens to be free."),
});

export type StatementProps = z.input<typeof statementSchema>;

export const StatementDef = defineBlock(
  'statement',
  "Statement",
  "One large paragraph whose words light up as visitors scroll.",
  statementSchema,
  [...chapterFields, { name: "text", label: "Statement", type: "textarea" }]
);
