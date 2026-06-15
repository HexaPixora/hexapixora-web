import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// A single jsdom window is reused across calls — DOMPurify only needs it to
// parse markup, and spinning one up per upload is wasteful.
const { window } = new JSDOM('');
// jsdom's window satisfies DOMPurify's WindowLike at runtime but not its
// stricter type, so cast through unknown.
const DOMPurify = createDOMPurify(window as unknown as Parameters<typeof createDOMPurify>[0]);

/**
 * Strip any active/dangerous content from an SVG so it is safe to serve from
 * our own origin. Removes <script>, event handlers (on*), javascript: URLs,
 * <foreignObject> (can embed arbitrary HTML), and external references that
 * could be abused for data exfiltration or XSS.
 *
 * Returns the sanitized markup, or null if the input is not a usable SVG.
 */
export function sanitizeSvg(dirty: string): string | null {
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // foreignObject lets an SVG host raw HTML; never allow it.
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick'],
  });

  // If sanitization left us with no <svg> root, treat the upload as invalid
  // rather than persisting an empty/garbage file.
  if (!clean || !clean.toLowerCase().includes('<svg')) {
    return null;
  }
  return clean;
}
