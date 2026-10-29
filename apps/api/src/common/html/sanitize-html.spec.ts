import { sanitizeHtml, sanitizeSections } from './sanitize-html';

describe('sanitizeHtml', () => {
  it('keeps ordinary article markup', () => {
    const html =
      '<h2>Title</h2><p>Text <strong>bold</strong> <a href="/x">link</a></p><ul><li>a</li></ul><table><tbody><tr><td>1</td></tr></tbody></table>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('keeps details/summary used by imported FAQs', () => {
    const html =
      '<details class="faq-item"><summary>Q</summary><div class="faq-answer"><p>A</p></div></details>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes scripts, event handlers and javascript: links', () => {
    const out = sanitizeHtml(
      '<p onclick="steal()">hi</p><script>alert(1)</script><a href="javascript:alert(2)">x</a><img src="x" onerror="alert(3)">',
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain('<p>hi</p>');
  });

  it('removes styles, frames and forms', () => {
    const out = sanitizeHtml(
      '<style>body{}</style><iframe src="https://evil.test"></iframe><form><input></form><p style="color:red">t</p>',
    );
    expect(out).toBe('<p>t</p>');
  });

  it('adds rel to links that open a new tab', () => {
    expect(sanitizeHtml('<a href="https://a.test" target="_blank">a</a>')).toBe(
      '<a href="https://a.test" target="_blank" rel="noopener noreferrer">a</a>',
    );
  });
});

describe('sanitizeSections', () => {
  it('cleans only rich-text content and leaves other blocks alone', () => {
    const sections = [
      {
        id: '1',
        type: 'RichTextModule',
        config: { heading: 'H', content: '<p>ok</p><script>x</script>' },
      },
      {
        id: '2',
        type: 'CustomCodeModule',
        config: { html: '<script>kept()</script>' },
      },
    ];
    const out = sanitizeSections(sections);
    expect(out[0].config).toEqual({ heading: 'H', content: '<p>ok</p>' });
    expect(out[1]).toBe(sections[1]);
  });

  it('returns non-arrays unchanged', () => {
    expect(sanitizeSections(undefined)).toBeUndefined();
  });
});
