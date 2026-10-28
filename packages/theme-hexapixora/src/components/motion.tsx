"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * Container that reveals and staggers its <StaggerItem> children as it scrolls
 * into view. Use in place of a plain wrapper/grid `<div>`; children that should
 * animate must be <StaggerItem>. Fires once.
 */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  hoverLift = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Adds a subtle spring lift on hover (via Framer, so it doesn't fight the
   *  reveal transform the way a CSS hover:-translate-y would). */
  hoverLift?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      whileHover={hoverLift ? { y: -6, transition: { type: "spring", stiffness: 300, damping: 22 } } : undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts up from 0 to the numeric part of `value` the first time it's in view.
 * Accepts strings like "120+", "40%", "$1,200", "99.9%" — the surrounding
 * prefix/suffix are preserved and only the number animates.
 */
export function CountUp({ value, className }: { value: string | number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  const raw = String(value);
  const match = raw.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = (match?.[2] ?? "").replace(/,/g, "");
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr);
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!match || !isFinite(target)) return;
    if (!inView) return;
    if (reduce) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration: Math.min(2, 0.6 + target / 120),
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, target, reduce, match]);

  // Non-numeric value — render as-is.
  if (!match || !isFinite(target)) {
    return <span className={className}>{raw}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
