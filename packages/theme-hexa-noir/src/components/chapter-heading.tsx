/**
 * The chapter row above a section ("01 / The studio … HexaPixora"). The
 * heading is the section's <h2>, so every section has a real heading for
 * search engines and screen readers while looking like a small label.
 */
export function ChapterHeading({
  id,
  chapter,
  heading,
  aside,
}: {
  id: string;
  chapter?: string;
  heading: string;
  aside?: string;
}) {
  if (!heading) return null;
  return (
    <div data-part="chapter" className="mono mb-chapter flex justify-between gap-5 text-copy-dim">
      <h2 id={id} className="font-normal">
        {chapter ? (
          <>
            <span className="font-medium text-signal">{chapter}</span>
            {" / "}
          </>
        ) : null}
        {heading}
      </h2>
      {aside ? <span className="text-right">{aside}</span> : null}
    </div>
  );
}
