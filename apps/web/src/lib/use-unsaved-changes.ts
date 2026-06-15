"use client";

import { useEffect } from "react";

/**
 * Warns the user before they lose unsaved work.
 *
 * While `isDirty` is true, registers a `beforeunload` handler so the browser
 * prompts on refresh, tab close, typing a new URL, or following a full-page
 * link (the admin sidebar uses plain <a href> links, which this covers).
 *
 * In-app client-side navigations (Next <Link>) do NOT trigger beforeunload —
 * guard those explicitly with a confirm dialog at the navigation control.
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required by some browsers to trigger the native prompt.
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
