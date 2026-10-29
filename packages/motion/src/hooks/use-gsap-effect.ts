"use client";

import { useEffect, useRef, type RefObject } from "react";
import { loadGsap, prefersReducedMotion, whenIdle, type GsapTools } from "../load-gsap";

/**
 * Runs a GSAP setup for one element once the page is idle. The markup is
 * always rendered in its final state, so with reduced motion (or before GSAP
 * arrives, or without JS) the content simply shows. Everything the setup
 * creates is scoped to a gsap.context and reverted on unmount.
 */
export function useGsapEffect<T extends Element>(
  setup: (tools: GsapTools, el: T) => void,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let revert: (() => void) | undefined;
    const cancelIdle = whenIdle(() => {
      void loadGsap().then((tools) => {
        if (cancelled) return;
        const ctx = tools.gsap.context(() => setupRef.current(tools, el), el);
        revert = () => ctx.revert();
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      revert?.();
    };
  }, []);

  return ref;
}
