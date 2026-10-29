import type { CSSProperties } from "react";

export type HeroTitleLine = { text: string; className?: string };

/**
 * A headline whose lines rise into place on load. The rise is a CSS animation
 * (styles/motion.css), not GSAP: the headline is usually the LCP element and
 * must not wait for JavaScript. With reduced motion it is static.
 */
export function HeroTitle({
  lines,
  as: Tag = "h1",
  id,
  className,
}: {
  lines: ReadonlyArray<HeroTitleLine>;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}) {
  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} data-rise-line="" className={line.className}>
          <span style={{ "--rise-index": i } as CSSProperties}>{line.text}</span>
        </span>
      ))}
    </Tag>
  );
}
