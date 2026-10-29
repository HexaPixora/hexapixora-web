import { BlockHead, labelledBy } from "../../../components/block-head";
import { SectionFrame } from "../../../components/section-frame";
import type { TextLayoutProps } from "../text-block";

/** HTML from the editor, cleaned by the API on save. */
function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose prose-invert prose-lg noir-prose mt-10 max-w-none break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Long formatted text (articles, legal pages). As a page's first section its
 * heading is the page's <h1> and it clears the fixed header.
 */
export function ProseText({ c, headingId, first }: TextLayoutProps) {
  if (first) {
    return (
      <section
        data-block="text"
        data-variant="prose"
        aria-labelledby={labelledBy(headingId, c)}
        className="pb-section pt-[calc(var(--header-h)+64px)]"
      >
        <div className="page-width">
          <div className="max-w-[72ch]">
            {c.label ? <p className="mono mb-5 text-signal">{c.label}</p> : null}
            {c.heading ? (
              <h1 id={headingId} className="wide whitespace-pre-line text-display-md font-medium">
                {c.heading}
              </h1>
            ) : null}
            {c.note ? <p className="mono mt-5 text-copy-dim">{c.note}</p> : null}
            {c.intro ? <p className="mt-6 text-lg text-copy-dim">{c.intro}</p> : null}
            <Prose html={c.content} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <SectionFrame block="text" variant="prose" surface={c.surface} labelledBy={labelledBy(headingId, c)}>
      <div className="max-w-[72ch]">
        <BlockHead id={headingId} head={c} />
        {c.note ? <p className="mono -mt-8 text-copy-dim">{c.note}</p> : null}
        <Prose html={c.content} />
      </div>
    </SectionFrame>
  );
}
