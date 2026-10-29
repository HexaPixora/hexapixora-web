"use client";

import { useEffect, type ReactNode } from "react";
import { EDITOR_FONT_CLASSES } from "./editor-fonts";

const FRAME_CSS_ID = "editor-frame-css";
const PACK_CSS_ID = "theme-pack";

/**
 * Puck's preview frame dressed as the site: the theme's stylesheet
 * (public/editor-frame.css), the active theme pack's CSS, the site's fonts
 * and blocks at rest (`data-motion="static"`). Puck also copies the admin's
 * styles into the frame (its own editor overlays need them); ours stay last,
 * so the theme's rules win wherever both style the same thing.
 */
export function EditorFrame({
  children,
  document: frame,
  packCss,
}: {
  children: ReactNode;
  document?: Document;
  /** The active theme pack's compiled CSS; empty for the built-in theme. */
  packCss: string;
}) {
  useEffect(() => {
    if (!frame) return;
    const head = frame.head;

    let link = frame.getElementById(FRAME_CSS_ID) as HTMLLinkElement | null;
    if (!link) {
      link = frame.createElement("link");
      link.id = FRAME_CSS_ID;
      link.rel = "stylesheet";
      link.href = "/editor-frame.css";
    }
    let pack = frame.getElementById(PACK_CSS_ID) as HTMLStyleElement | null;
    if (!pack) {
      pack = frame.createElement("style");
      pack.id = PACK_CSS_ID;
    }
    // textContent, never innerHTML: the pack CSS can't open other tags.
    pack.textContent = packCss;

    // Ours stay the last two in <head>; checking first stops the observer
    // from reacting to its own moves.
    const order = () => {
      if (
        head.lastElementChild === pack &&
        pack.previousElementSibling === link
      )
        return;
      head.append(link, pack);
    };
    // Puck mirrors the admin's <body> classes into the frame (bg-background,
    // font-sans…), which would beat the theme's body styles; the frame body
    // keeps only the font variables instead.
    const bodyClass = EDITOR_FONT_CLASSES.join(" ");
    const dress = () => {
      if (frame.body.className !== bodyClass) frame.body.className = bodyClass;
    };
    order();
    dress();
    const headObserver = new MutationObserver(order);
    headObserver.observe(head, { childList: true });
    const bodyObserver = new MutationObserver(dress);
    bodyObserver.observe(frame.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      headObserver.disconnect();
      bodyObserver.disconnect();
    };
  }, [frame, packCss]);

  // The wrapper exists before any block mounts, so every block sees it when
  // its motion effect runs (child effects run before this component's).
  return (
    <div data-motion="static" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
