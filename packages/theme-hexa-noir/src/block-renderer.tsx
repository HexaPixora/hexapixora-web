import React from "react";
import { resolveAnchorId, type Section } from "@hexapixora/contracts/blocks/registry";
import { isBlockId, type BlockId } from "@hexapixora/contracts/blocks/library";
import { LIBRARY_BLOCKS } from "./block-map";
import { MediaAltProvider } from "./components/media-alt-provider";
import type { BlockProps } from "./lib/block-props";

/**
 * A stored block type this theme has no component for. Visitors see nothing
 * (an empty box would be thin content); developers get a note.
 */
function DefaultSection({ type, label }: { type: string; label?: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <section data-block="unknown" className="border-t border-line py-16">
      <div className="page-width">
        <p className="mono border border-dashed border-line p-8 text-copy-dim">
          No component for <span className="text-signal">{type}</span>
          {label && label !== type ? ` (${label})` : ""}
        </p>
      </div>
    </section>
  );
}

type Resolved = { type: BlockId; config: Record<string, unknown>; Block: React.ComponentType<BlockProps> };

/** What to render for a stored section; types outside the block library resolve to nothing. */
function resolve(section: Section): Resolved | null {
  if (!isBlockId(section.type)) return null;
  return { type: section.type, config: section.config ?? {}, Block: LIBRARY_BLOCKS[section.type] };
}

interface BlockRendererProps {
  sections: Section[];
  // filename -> alt text from the media library (GET /media/alt-text)
  altTexts?: Record<string, string>;
  /** Latest published posts, loaded by the app when a page has a blog block. */
  latestPosts?: unknown[];
}

export function BlockRenderer({ sections, altTexts, latestPosts }: BlockRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Track anchor ids already used on this page so we never emit a duplicate id.
  const usedAnchors = new Set<string>();

  return (
    <MediaAltProvider altTexts={altTexts}>
      {sections
        .filter((s) => s.isVisible)
        .map((section, index) => {
          const resolved = resolve(section);
          if (!resolved) return <DefaultSection key={section.id} type={section.type} label={section.label} />;
          const { type, config, Block } = resolved;

          // Anchor id for in-page links (#contact, #faq, …). First section to
          // claim an id wins; duplicates are dropped to keep the HTML valid.
          const candidate = resolveAnchorId(type, config);
          const anchor = candidate && !usedAnchors.has(candidate) ? candidate : "";
          if (anchor) usedAnchors.add(anchor);

          // Blocks run their own entrance motion, so they render as they are.
          const content = <Block config={config} first={index === 0} posts={latestPosts} />;

          return anchor ? (
            <div key={section.id} id={anchor} className="scroll-mt-24">
              {content}
            </div>
          ) : (
            <React.Fragment key={section.id}>{content}</React.Fragment>
          );
        })}
    </MediaAltProvider>
  );
}
