/**
 * The heading group of the older blocks: a small label, the section's <h2>
 * and an intro line. Renders nothing when all three are empty.
 */
export function SectionHeading({
  id,
  eyebrow,
  heading,
  subheading,
  className = "",
}: {
  id: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  className?: string;
}) {
  if (!eyebrow && !heading && !subheading) return null;
  return (
    <div className={`mb-chapter ${className}`}>
      {eyebrow ? <p className="mono mb-5 text-signal">{eyebrow}</p> : null}
      {heading ? (
        <h2 id={id} className="wide max-w-[20ch] text-display-md font-medium">
          {heading}
        </h2>
      ) : null}
      {subheading ? <p className="mt-5 max-w-[56ch] text-lg text-copy-dim">{subheading}</p> : null}
    </div>
  );
}
