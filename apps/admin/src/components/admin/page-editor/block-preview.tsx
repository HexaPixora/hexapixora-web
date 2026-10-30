"use client";

import { LIBRARY_BLOCKS } from "@hexapixora/theme-hexa-noir/block-map";
import type { BlockId } from "@hexapixora/contracts/blocks/library";
import { HIDDEN_PROP, propsToConfig } from "@/lib/puck/puck-sections";

/**
 * One block in the editor preview, drawn by the theme's own component, as on
 * the site. Hidden blocks stay in the preview so they can be edited, dimmed
 * and marked; the site never renders them.
 */
export function BlockPreview({
  type,
  props,
  posts,
}: {
  type: BlockId;
  props: Record<string, unknown>;
  /** Latest published posts, for the posts block. */
  posts: unknown[];
}) {
  const Block = LIBRARY_BLOCKS[type];
  const block = (
    <Block
      config={propsToConfig(props)}
      first={type === "hero"}
      posts={posts}
    />
  );
  if (props[HIDDEN_PROP] !== true) return block;
  return (
    <div style={{ position: "relative", opacity: 0.45 }}>
      <span
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 60,
          padding: "4px 10px",
          font: "600 12px/1.4 system-ui, sans-serif",
          background: "var(--color-signal)",
          color: "var(--color-on-signal)",
        }}
      >
        Hidden on the page
      </span>
      {block}
    </div>
  );
}
