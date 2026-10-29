import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { richTextSchema } from "@hexapixora/contracts/blocks/legacy/rich-text";

/**
 * Long-form text written in the admin editor (legal pages, notes). It usually
 * opens its page, so its heading is the <h1> and it clears the fixed header.
 */
export function RichTextBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(richTextSchema, config);
  const headingId = useId();

  return (
    <section
      data-block="rich-text"
      aria-labelledby={c.heading ? headingId : undefined}
      className="pb-section pt-[calc(var(--header-h)+64px)]"
    >
      <div className="page-width">
        <div className="max-w-[72ch]">
          {c.heading ? (
            <h1 id={headingId} className="wide text-display-md font-medium">
              {c.heading}
            </h1>
          ) : null}
          {c.lastUpdated ? <p className="mono mt-5 text-copy-dim">{c.lastUpdated}</p> : null}
          {/* Admin-authored HTML from the editor; only signed-in admins can write it. */}
          <div
            className="prose prose-invert prose-lg noir-prose mt-10 max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: c.content }}
          />
        </div>
      </div>
    </section>
  );
}
