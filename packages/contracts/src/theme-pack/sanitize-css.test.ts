import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeThemeCss } from "./sanitize-css";

const url = (path: string) => `https://cdn.test/themes/paper/1.0.0/${path}`;
const assets = new Set(["assets/grain.webp", "assets/body.woff2"]);
const clean = (css: string) => sanitizeThemeCss(css, url, assets);

describe("sanitizeThemeCss", () => {
  it("keeps rules on the theme hooks", () => {
    const input = '[data-block="cta"][data-variant="band"] { border-radius: 0; }\n[data-part="file"]:hover { rotate: 2deg; }';
    const { css, removed } = clean(input);
    assert.match(css, /\[data-block="cta"\]\[data-variant="band"\]/);
    assert.match(css, /\[data-part="file"\]:hover/);
    assert.deepEqual(removed, []);
  });

  it("drops selectors that reach outside the hooks", () => {
    const { css, removed } = clean("body { display: none } a { color: red } * { margin: 0 } html, [data-block] { x: y }");
    assert.equal(css.trim(), "");
    assert.equal(removed.length, 4);
  });

  it("keeps only custom properties on :root and body", () => {
    const { css } = clean(":root { --color-page: #fff; } body { --font-body: Inter; color: red }");
    assert.match(css, /--color-page: #fff/);
    assert.doesNotMatch(css, /color: red/);
  });

  it("removes @import, unknown at-rules and unsafe values", () => {
    const { css, removed } = clean(
      '@import url("https://evil.test/x.css");\n@charset "utf-8";\n[data-block] { width: expression(alert(1)); background: url(javascript:alert(1)); -moz-binding: url(x.xml); color: #fff }',
    );
    assert.doesNotMatch(css, /import|expression|javascript|binding/);
    assert.match(css, /color: #fff/);
    assert.ok(removed.length >= 4);
  });

  it("rewrites url() to the pack's own assets and drops any other url()", () => {
    const { css } = clean(
      '[data-surface="raised"] { background-image: url(assets/grain.webp) }\n[data-block] { background: url("https://tracker.test/p.gif") }\n[data-block] { background: url(assets/missing.png) }',
    );
    assert.match(css, /url\("https:\/\/cdn\.test\/themes\/paper\/1\.0\.0\/assets\/grain\.webp"\)/);
    assert.doesNotMatch(css, /tracker|missing/);
  });

  it("keeps @media, @keyframes and pack @font-face", () => {
    const { css } = clean(
      '@media (max-width: 600px) { [data-block="hero"] { padding: 0 } }\n@keyframes glow { from { opacity: 0 } to { opacity: 1 } }\n@font-face { font-family: Body; src: url(assets/body.woff2) format("woff2") }',
    );
    assert.match(css, /@media/);
    assert.match(css, /@keyframes glow/);
    assert.match(css, /@font-face/);
    assert.match(css, /assets\/body\.woff2/);
  });

  it("removes markup and refuses oversized files", () => {
    const { css, removed } = clean('[data-block] { content: "</style><script>"; color: red }');
    assert.doesNotMatch(css, /<\//);
    assert.match(css, /color: red/);
    assert.equal(removed.length, 1);
    assert.throws(() => clean("[data-block] { color: red }".repeat(5000)));
  });
});
