import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { statementSchema } from "@hexapixora/contracts/blocks/statement";
import { WordLight } from "@hexapixora/motion/word-light";
import { ChapterHeading } from "../../components/chapter-heading";
import { SectionFrame } from "../../components/section-frame";

export function StatementBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(statementSchema, config);
  const headingId = useId();

  return (
    <SectionFrame block="statement" labelledBy={c.heading ? headingId : undefined}>
      <ChapterHeading id={headingId} chapter={c.chapter} heading={c.heading} aside={c.aside} />
      <WordLight text={c.text} className="max-w-[24ch] font-display text-statement font-light" />
    </SectionFrame>
  );
}
