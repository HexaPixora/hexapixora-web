// Alt text set in the admin media library, keyed by the stored filename
// (a content hash, so it's unique). MediaAltProvider fills this during render on
// both the server and the client, so the markup always hydrates identically.
let altByFile: Record<string, string> = {};

export function setMediaAltTexts(map: Record<string, string> | undefined) {
  altByFile = map ?? {};
}

// Library alt text for an image URL, else the module's own fallback text.
export function mediaAlt(src: string | null | undefined, fallback = ""): string {
  if (!src) return fallback;
  const file = (src.split(/[?#]/)[0] ?? "").split("/").pop() ?? "";
  return altByFile[file] || fallback;
}
