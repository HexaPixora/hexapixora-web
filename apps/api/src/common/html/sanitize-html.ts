import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// One jsdom window for the whole process; DOMPurify only needs it to parse.
const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

// Links that open a new tab must not hand the opener to the other site.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Clean editor-written HTML (rich text sections, blog posts) before it is
 * stored, so the site can render it as-is. Keeps ordinary article markup
 * (headings, lists, tables, links, images, details/summary); removes
 * scripts, styles, frames, forms, event handlers and javascript: URLs.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['style'],
  });
}

/** Block types whose config holds editor-written HTML, and the field it is in. */
const HTML_FIELDS: Record<string, string> = {
  // The block library's text block (plans/phase-3c).
  text: 'content',
  // Its old name, kept until stored pages have moved.
  RichTextModule: 'content',
};

/**
 * Returns page sections with the HTML fields of rich-text blocks cleaned.
 * Anything that isn't a section array is returned unchanged.
 */
export function sanitizeSections<T>(sections: T): T {
  if (!Array.isArray(sections)) return sections;
  return sections.map((section: unknown) => {
    if (!section || typeof section !== 'object') return section;
    const { type, config } = section as { type?: unknown; config?: unknown };
    const field = typeof type === 'string' ? HTML_FIELDS[type] : undefined;
    if (!field || !config || typeof config !== 'object') return section;
    const value = (config as Record<string, unknown>)[field];
    if (typeof value !== 'string') return section;
    return { ...section, config: { ...config, [field]: sanitizeHtml(value) } };
  }) as T;
}
