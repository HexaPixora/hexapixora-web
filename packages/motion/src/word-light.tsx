"use client";

import { Fragment } from "react";
import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * A statement whose words light up one by one as it scrolls through the
 * viewport. Words render fully lit; the dimming only exists while scrubbing.
 */
export function WordLight({
  text,
  as: Tag = "p",
  className,
  dim = 0.12,
}: {
  text: string;
  as?: "p" | "h2" | "h3";
  className?: string;
  /** Opacity of a word before it lights up. */
  dim?: number;
}) {
  const ref = useGsapEffect<HTMLElement>(({ gsap }, el) => {
    gsap.fromTo(
      el.querySelectorAll("[data-word]"),
      { opacity: dim },
      {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true },
      },
    );
  });

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref as React.RefObject<HTMLParagraphElement & HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span data-word="">{word}</span>
        </Fragment>
      ))}
    </Tag>
  );
}
