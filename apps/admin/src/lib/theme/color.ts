/** The value of the last `name:` declaration in `css` (later rules win), or null. */
export function lastDeclaration(css: string, name: string): string | null {
  const pattern = new RegExp(`${name.replace(/[-]/g, "\\-")}\\s*:\\s*([^;}]+)`, "g");
  let value: string | null = null;
  for (const match of css.matchAll(pattern)) value = match[1]?.trim() ?? null;
  return value;
}

/** Red, green and blue (0–255) of a hex or rgb() colour, or null for other forms. */
function channels(color: string): [number, number, number] | null {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = color.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

/**
 * Whether text on this background should be light: its relative luminance is
 * below the point where white and black text have equal contrast. Colours it
 * can't read count as dark, the built-in theme's scheme.
 */
export function isDarkColor(color: string): boolean {
  const rgb = channels(color.trim());
  if (!rgb) return true;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.179;
}
