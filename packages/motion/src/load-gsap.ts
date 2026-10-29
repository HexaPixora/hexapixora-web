import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export type GsapTools = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof ScrollTriggerType;
};

let pending: Promise<GsapTools> | null = null;

/**
 * Loads GSAP and ScrollTrigger as a separate chunk on first use, so pages pay
 * for animation only after they have painted. Every caller shares one load.
 */
export function loadGsap(): Promise<GsapTools> {
  pending ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    },
  );
  return pending;
}

/** Runs `task` when the browser is idle (or after `timeout` ms at the latest). */
export function whenIdle(task: () => void, timeout = 1500): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 200);
  return () => clearTimeout(id);
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
