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

const queue: Array<() => void> = [];
let draining = false;

// Budget per batch: well under the 50 ms that counts as a long task.
const BATCH_MS = 30;

function drain() {
  const until = performance.now() + BATCH_MS;
  while (queue.length > 0 && performance.now() < until) queue.shift()!();
  if (queue.length > 0) setTimeout(drain, 0);
  else draining = false;
}

/**
 * Runs effect setups a few at a time, yielding to the browser between
 * batches. Every effect on a page waits for the same GSAP load, so without
 * this they would all start in one long task and block input.
 */
export function scheduleSetup(task: () => void): void {
  queue.push(task);
  if (draining) return;
  draining = true;
  setTimeout(drain, 0);
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

/**
 * True when motion should stay off: the visitor asked for reduced motion, or
 * `el` sits inside a `data-motion="static"` container (the page editor's
 * preview, where blocks must show at rest and the scroll belongs to the editor).
 */
export function prefersReducedMotion(el?: Element | null): boolean {
  if (el?.closest('[data-motion="static"]')) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
