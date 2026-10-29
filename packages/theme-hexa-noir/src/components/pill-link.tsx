import type { ReactNode } from "react";
import { PILL_CLASS, SafeLink } from "./safe-link";

const VARIANTS = {
  solid: "bg-signal text-on-signal hover:bg-copy hover:text-page",
  outline: "border border-copy hover:bg-copy hover:text-page",
} as const;

/** The call-to-action button: a pill link, solid (primary) or outlined. */
export function PillLink({
  href,
  variant = "solid",
  size = "md",
  className = "",
  children,
}: {
  href: string | undefined;
  variant?: keyof typeof VARIANTS;
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const sizing = size === "lg" ? "px-[30px] py-[18px] text-base" : "px-5 py-3.5 text-sm";
  return (
    <SafeLink href={href} className={`${PILL_CLASS} ${sizing} ${VARIANTS[variant]} ${className}`}>
      {children} <span aria-hidden="true">→</span>
    </SafeLink>
  );
}
