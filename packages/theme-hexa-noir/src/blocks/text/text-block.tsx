import { useId, type ComponentType } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { textSchema, type TextConfig } from "@hexapixora/contracts/blocks/text";
import type { BlockProps } from "../../lib/block-props";
import { ProseText } from "./layouts/prose-text";
import { SplitText } from "./layouts/split-text";
import { StatementText } from "./layouts/statement-text";

export type TextLayoutProps = { c: TextConfig; headingId: string; first: boolean };

const LAYOUTS: Record<TextConfig["layout"], ComponentType<TextLayoutProps>> = {
  statement: StatementText,
  prose: ProseText,
  split: SplitText,
};

export function TextBlock({ config, first = false }: BlockProps) {
  const c = parseBlockConfig(textSchema, config);
  const headingId = useId();
  const Layout = LAYOUTS[c.layout];
  return <Layout c={c} headingId={headingId} first={first} />;
}
