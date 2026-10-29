import { z } from 'zod';
import { defineBlock } from './define-block';
import { chapterFields, chapterShape } from './section-fields';

/** The detail rows of a case file, in display order. */
export const CASE_FILE_ROWS = [
  { key: "client", label: "Client" },
  { key: "sector", label: "Sector" },
  { key: "region", label: "Region" },
  { key: "scope", label: "Scope" },
  { key: "outcome", label: "Outcome" },
] as const;

const fileSchema = z.object({
  stamp: z.string().default("NDA"),
  number: z.string().default(""),
  title: z.string().default(""),
  client: z.string().default(""),
  clientRedacted: z.boolean().default(true),
  sector: z.string().default(""),
  sectorRedacted: z.boolean().default(false),
  region: z.string().default(""),
  regionRedacted: z.boolean().default(true),
  scope: z.string().default(""),
  scopeRedacted: z.boolean().default(false),
  outcome: z.string().default(""),
  outcomeRedacted: z.boolean().default(false),
});

export const caseFilesSchema = z.object({
  ...chapterShape,
  chapter: z.string().default("04"),
  heading: z.string().default("Case files"),
  aside: z.string().default("Names withheld under NDA"),
  variant: z.enum(["paper", "flat"]).default("paper"),
  counters: z.array(z.object({
    value: z.string().default(""),
    suffix: z.string().default(""),
    label: z.string().default(""),
  })).default([
    { value: "20", suffix: "+", label: "Projects in 2 years" },
    { value: "100", suffix: "%", label: "On the agreed date" },
    { value: "B2B", suffix: "", label: "& e-commerce" },
    { value: "2026", suffix: "", label: "Web creativity award" },
  ]),
  files: z.array(fileSchema).default([
    { ...fileSchema.parse({}), stamp: "AWARD", number: "Case file 01", title: "Award-winning B2B site", sector: "B2B", scope: "Website design & build", outcome: "Web creativity award, 2026" },
    { ...fileSchema.parse({}), number: "Case file 02", title: "E-commerce brand", sector: "E-commerce", scope: "Online store", outcome: "Delivered on the agreed date" },
    { ...fileSchema.parse({}), number: "Case file 03", title: "B2B platform", sector: "B2B", scope: "Custom platform", outcome: "Delivered on the agreed date" },
  ]),
  note: z.string().default("References available on request."),
});

export type CaseFilesProps = z.input<typeof caseFilesSchema>;
export type CaseFile = z.output<typeof fileSchema>;

export const CaseFilesDef = defineBlock(
  'case-files',
  "Case Files",
  "Counters plus NDA-safe case files; any detail can be redacted (it is then never sent to the browser).",
  caseFilesSchema,
  [
    ...chapterFields,
    { name: "variant", label: "Style", type: "select", options: [{ label: "Paper dossiers", value: "paper" }, { label: "Flat cards", value: "flat" }] },
    {
      name: "counters", label: "Counters", type: "list", itemFields: [
        { name: "value", label: "Value", type: "text", description: "A whole number counts up; text is shown as is." },
        { name: "suffix", label: "Suffix", type: "text", placeholder: "+ or %" },
        { name: "label", label: "Label", type: "text" },
      ],
    },
    {
      name: "files", label: "Case files", type: "list", itemFields: [
        { name: "stamp", label: "Stamp", type: "text", placeholder: "NDA" },
        { name: "number", label: "File label", type: "text", placeholder: "Case file 01" },
        { name: "title", label: "Title", type: "text" },
        ...CASE_FILE_ROWS.flatMap((row) => [
          { name: row.key, label: row.label, type: "text" as const },
          { name: `${row.key}Redacted`, label: `Redact ${row.label.toLowerCase()}`, type: "boolean" as const },
        ]),
      ],
    },
    { name: "note", label: "Footnote", type: "text" },
  ]
);
