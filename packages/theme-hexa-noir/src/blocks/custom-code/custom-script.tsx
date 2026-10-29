"use client";

import { useEffect } from "react";

/**
 * Runs the Custom Code block's admin-authored script once the page is
 * interactive. The script gets its wrapper as `container` and may return a
 * cleanup function.
 */
export function CustomScript({ containerId, code }: { containerId: string; code: string }) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    let cleanup: unknown;
    try {
      cleanup = new Function("container", "window", "document", code)(container, window, document);
    } catch (err) {
      console.error("[custom-code] script failed:", err);
    }
    return () => {
      if (typeof cleanup === "function") {
        try {
          cleanup();
        } catch (err) {
          console.error("[custom-code] cleanup failed:", err);
        }
      }
    };
  }, [containerId, code]);

  return null;
}
