// What a theme pack zip may contain (plans/phase-3b). The API applies these
// rules while unpacking; the admin shows the same limits before uploading.

export const PACK_LIMITS = {
  zipBytes: 15 * 1024 * 1024,
  entries: 60,
  manifestBytes: 64 * 1024,
  fontBytes: 1024 * 1024,
  imageBytes: 2 * 1024 * 1024,
} as const;

type AssetType = { mime: string; maxBytes: number; matches: (bytes: Uint8Array) => boolean };

const starts = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);
const ascii = (text: string) => [...text].map((ch) => ch.charCodeAt(0));

/** Allowed asset types, recognised by their first bytes rather than their name. No SVG: it can carry script. */
export const ASSET_TYPES: Record<string, AssetType> = {
  woff2: { mime: "font/woff2", maxBytes: PACK_LIMITS.fontBytes, matches: (b) => starts(b, ascii("wOF2")) },
  png: {
    mime: "image/png",
    maxBytes: PACK_LIMITS.imageBytes,
    matches: (b) => starts(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  jpg: { mime: "image/jpeg", maxBytes: PACK_LIMITS.imageBytes, matches: (b) => starts(b, [0xff, 0xd8, 0xff]) },
  webp: {
    mime: "image/webp",
    maxBytes: PACK_LIMITS.imageBytes,
    matches: (b) => starts(b, ascii("RIFF")) && starts(b, ascii("WEBP"), 8),
  },
  avif: { mime: "image/avif", maxBytes: PACK_LIMITS.imageBytes, matches: (b) => starts(b, ascii("ftypavi"), 4) },
};

export type PackEntry = { kind: "manifest" } | { kind: "css" } | { kind: "asset"; ext: string };

/**
 * What a path inside the zip is, or an error. Only theme.json, theme.css and
 * flat files in assets/ with a lower-case name and an allowed extension pass;
 * absolute paths, "..", backslashes and nested folders do not.
 */
export function classifyPackPath(path: string): PackEntry | { error: string } {
  if (path === "theme.json") return { kind: "manifest" };
  if (path === "theme.css") return { kind: "css" };
  const match = /^assets\/([a-z0-9][a-z0-9._-]{0,80})\.([a-z0-9]+)$/.exec(path);
  if (!match || path.includes("..")) return { error: `"${path}" is not allowed in a theme pack.` };
  const ext = match[2] === "jpeg" ? "jpg" : match[2]!;
  if (!ASSET_TYPES[ext]) return { error: `"${path}": .${match[2]} files are not allowed.` };
  return { kind: "asset", ext };
}

/** Checks an asset's size and real type. Returns its MIME type, or an error. */
export function checkAsset(path: string, ext: string, bytes: Uint8Array): { mime: string } | { error: string } {
  const type = ASSET_TYPES[ext];
  if (!type) return { error: `"${path}": unknown file type.` };
  if (bytes.length > type.maxBytes) return { error: `"${path}" is larger than ${type.maxBytes / 1024 / 1024} MB.` };
  if (!type.matches(bytes)) return { error: `"${path}" is not a real .${ext} file.` };
  return { mime: type.mime };
}
