"use client";

import { useGsapEffect } from "./hooks/use-gsap-effect";

/**
 * A number that counts up from zero when it scrolls into view. The server
 * renders the final value, so search engines and no-JS visitors see it.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useGsapEffect<HTMLSpanElement>(({ gsap, ScrollTrigger }, el) => {
    if (ScrollTrigger.isInViewport(el)) return;
    const value = { v: 0 };
    const render = () => {
      el.textContent = `${prefix}${Math.round(value.v)}${suffix}`;
    };
    render();
    gsap.to(value, {
      v: to,
      duration,
      ease: "power2.out",
      onUpdate: render,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  return (
    <span ref={ref} className={className}>
      {`${prefix}${to}${suffix}`}
    </span>
  );
}
