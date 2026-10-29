"use client";

import { useEffect } from "react";
import { whenIdle } from "@hexapixora/motion/load-gsap";

type InstagramWindow = Window & { instgrm?: { Embeds?: { process: () => void } } };

const SCRIPT_ID = "instagram-embed-js";

/**
 * Loads Instagram's embed script once the page is idle (it is heavy and
 * third-party) and asks it to turn the reel links on the page into players.
 */
export function InstagramEmbeds() {
  useEffect(() => {
    const w = window as InstagramWindow;
    return whenIdle(() => {
      if (w.instgrm) {
        w.instgrm.Embeds?.process();
        return;
      }
      if (document.getElementById(SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      script.onload = () => w.instgrm?.Embeds?.process();
      document.body.appendChild(script);
    }, 3000);
  }, []);

  return null;
}
