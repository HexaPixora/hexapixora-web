import { WordLight } from "@hexapixora/motion/word-light";
import { BlockHead, labelledBy } from "../../../components/block-head";
import { SectionFrame } from "../../../components/section-frame";
import type { TextLayoutProps } from "../text-block";

/** One large statement whose words light up while scrolling. */
export function StatementText({ c, headingId }: TextLayoutProps) {
  if (!c.heading && !c.text) return null;
  return (
    <SectionFrame block="text" variant="statement" surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <BlockHead id={headingId} head={c} />
      {c.text ? <WordLight text={c.text} className="max-w-[24ch] font-display text-statement font-light" /> : null}
    </SectionFrame>
  );
}
