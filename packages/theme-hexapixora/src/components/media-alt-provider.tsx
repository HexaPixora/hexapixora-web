"use client";

import type { ReactNode } from "react";
import { setMediaAltTexts } from "../lib/media-alt";

// Makes media-library alt text available to the page's modules. It is set
// synchronously before children render, on the server and again on hydration.
export function MediaAltProvider({
  altTexts,
  children,
}: {
  altTexts?: Record<string, string>;
  children: ReactNode;
}) {
  setMediaAltTexts(altTexts);
  return <>{children}</>;
}
