"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@hexapixora/ui/input";
import { SITE_URL } from "@/lib/site-url";

const SITE_ORIGIN = (() => {
  try {
    return new URL(SITE_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * The real site in a frame, restyled live: the site (in ?theme-live=1 mode)
 * says it is ready, and we post it the current theme CSS. Only the site's
 * origin is talked to, and the site only accepts messages from the admin.
 */
export function LivePreview({ css }: { css: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(css);
  const [path, setPath] = useState("/");
  const [src, setSrc] = useState(`${SITE_URL}/?theme-live=1`);

  const send = () =>
    frame.current?.contentWindow?.postMessage({ type: "hexapixora:theme-css", css: latest.current }, SITE_ORIGIN);

  useEffect(() => {
    latest.current = css;
    const timer = setTimeout(send, 150);
    return () => clearTimeout(timer);
  }, [css]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== SITE_ORIGIN || event.source !== frame.current?.contentWindow) return;
      if ((event.data as { type?: unknown } | null)?.type === "hexapixora:theme-ready") send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const open = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = `/${path.replace(/^\/+/, "")}`;
    setSrc(`${SITE_URL}${clean}${clean.includes("?") ? "&" : "?"}theme-live=1`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-muted/20">
      <form onSubmit={open} className="flex items-center gap-2 border-b p-2">
        <label htmlFor="preview-path" className="text-xs text-muted-foreground">
          Page
        </label>
        <Input
          id="preview-path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="h-8 font-mono text-xs"
        />
      </form>
      <iframe
        ref={frame}
        src={src}
        title="Live preview of the site with this theme"
        className="min-h-[70vh] w-full flex-1 bg-white"
      />
    </div>
  );
}
