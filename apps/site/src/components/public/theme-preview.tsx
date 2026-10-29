"use client";

import { useEffect, useState } from "react";
import { isSafeThemeCss } from "@/lib/theme-css";

const PARAM = "theme-preview";
const STORE = "hexapixora:theme-preview";
const STYLE_ID = "theme-pack-preview";
const TOKEN = /^[A-Za-z0-9._-]{16,512}$/;
const LIVE_PARAM = "theme-live";
const LIVE_STORE = "hexapixora:theme-live";
/** The admin's origin: the only sender live CSS is accepted from (set at build). */
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? "";

/** Puts preview CSS on the page as text: a style element never parses markup. */
function applyCss(css: string) {
  const style = document.getElementById(STYLE_ID) ?? document.head.appendChild(document.createElement("style"));
  style.id = STYLE_ID;
  style.textContent = css;
}

/** Live mode: framed by the admin's theme editor, opened with ?theme-live=1 (remembered for this frame). */
function isLiveFrame(): boolean {
  if (!ADMIN_ORIGIN || window.parent === window) return false;
  try {
    if (new URLSearchParams(window.location.search).get(LIVE_PARAM) === "1") {
      sessionStorage.setItem(LIVE_STORE, "1");
      return true;
    }
    return sessionStorage.getItem(LIVE_STORE) === "1";
  } catch {
    return false;
  }
}

function readToken(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(PARAM);
    if (fromUrl && TOKEN.test(fromUrl)) {
      sessionStorage.setItem(STORE, fromUrl);
      return fromUrl;
    }
    const stored = sessionStorage.getItem(STORE);
    return stored && TOKEN.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Private theme preview (plans/phase-3b). The admin opens the site with
 * ?theme-preview=<signed token>; this tab then shows that pack on every page
 * until "Exit preview". The token is kept in sessionStorage only, so other
 * tabs, browsers and visitors keep the active theme, and pages stay cached.
 *
 * Live mode feeds the admin's theme editor: framed by the admin, the site asks
 * for CSS and applies what the admin's exact origin sends, on every page the
 * editor navigates to.
 */
export function ThemePreview() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!isLiveFrame()) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== ADMIN_ORIGIN || event.source !== window.parent) return;
      const data = event.data as { type?: unknown; css?: unknown } | null;
      if (data?.type === "hexapixora:theme-css" && isSafeThemeCss(data.css)) applyCss(data.css);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "hexapixora:theme-ready" }, ADMIN_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const token = readToken();
    if (!token) return;
    let cancelled = false;
    fetch(`/api/themes/preview/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { data?: { css?: unknown; name?: unknown } } | null) => {
        const css = body?.data?.css;
        if (cancelled || !isSafeThemeCss(css)) return;
        applyCss(css);
        setName(typeof body?.data?.name === "string" ? body.data.name : "Theme");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!name) return null;

  const exit = () => {
    try {
      sessionStorage.removeItem(STORE);
    } catch {
      // Storage blocked: the preview simply ends with this page.
    }
    document.getElementById(STYLE_ID)?.remove();
    setName(null);
  };

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-4 border border-line bg-page-raised px-4 py-2.5 text-sm"
    >
      <span className="mono text-signal">Preview</span>
      <span>{name}</span>
      <button type="button" onClick={exit} className="mono text-copy-dim transition-colors hover:text-copy">
        Exit preview
      </button>
    </div>
  );
}
