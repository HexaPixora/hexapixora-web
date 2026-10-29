import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { themeManifestSchema, themeTokensSchema } from "./schema";
import { tokensToCss } from "./tokens-to-css";

const url = (path: string) => `https://cdn.test/themes/paper/1.0.0/${path}`;

describe("themeManifestSchema", () => {
  it("accepts a minimal pack and fills empty token groups", () => {
    const pack = themeManifestSchema.parse({ name: "Paper", slug: "paper", version: "1.0.0" });
    assert.deepEqual(pack.tokens.colors, {});
    assert.equal(pack.author, "");
  });

  it("rejects unknown keys, bad slugs and bad versions", () => {
    assert.throws(() => themeManifestSchema.parse({ name: "P", slug: "Paper!", version: "1.0.0" }));
    assert.throws(() => themeManifestSchema.parse({ name: "P", slug: "paper", version: "1.0" }));
    assert.throws(() => themeManifestSchema.parse({ name: "P", slug: "paper", version: "1.0.0", script: "x" }));
    assert.throws(() => themeTokensSchema.parse({ colors: { banana: "#fff" } }));
  });

  it("rejects values that could break out of a declaration", () => {
    const bad = [
      { colors: { page: "#fff;}body{display:none" } },
      { colors: { page: "red" } },
      { colors: { page: "rgb(0 0 0) url(x)" } },
      { type: { title: "1rem;color:red" } },
      { type: { title: "expression(alert(1))" } },
      { motion: { cut: "linear" } },
      { fonts: { body: { family: 'Inter"}', files: [] } } },
      { fonts: { body: { family: "Inter", files: [{ src: "../x.woff2" }] } } },
      { fonts: { body: { family: "Inter", files: [{ src: "assets/x.ttf" }] } } },
    ];
    for (const tokens of bad) assert.throws(() => themeTokensSchema.parse(tokens), JSON.stringify(tokens));
  });

  it("accepts the value forms the theme uses", () => {
    const tokens = themeTokensSchema.parse({
      colors: { page: "#f4efe6", line: "rgb(21 22 28 / 0.14)", signal: "oklch(0.7 0.2 40)" },
      type: { "display-xl": "clamp(3rem, 11vw, 10rem)", label: "0.75rem" },
      space: { section: "140px", page: "1440px" },
      motion: { "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)" },
    });
    assert.equal(tokens.colors.line, "rgb(21 22 28 / 0.14)");
  });
});

describe("tokensToCss", () => {
  it("writes tokens as custom properties and fonts as @font-face", () => {
    const tokens = themeTokensSchema.parse({
      colors: { page: "#f4efe6", copy: "#15161c" },
      type: { title: "1.5rem" },
      space: { page: "1280px" },
      fonts: {
        display: {
          family: "Space Grotesk",
          fallback: "Helvetica Neue, Arial, sans-serif",
          files: [{ src: "assets/space-grotesk.woff2", weight: "300 700" }],
        },
      },
    });
    const css = tokensToCss(tokens, url);
    assert.match(css, /@font-face\{font-family:"Space Grotesk";src:url\("https:\/\/cdn\.test\/themes\/paper\/1\.0\.0\/assets\/space-grotesk\.woff2"\) format\("woff2"\);font-weight:300 700;font-style:normal;font-display:swap\}/);
    assert.match(css, /:root\{--color-page:#f4efe6;--color-copy:#15161c;--text-title:1\.5rem;--container-page:1280px\}/);
    assert.match(css, /body\{--font-display:"Space Grotesk", "Helvetica Neue", "Arial", sans-serif\}/);
  });

  it("writes nothing for empty tokens", () => {
    assert.equal(tokensToCss(themeTokensSchema.parse({}), url), "");
  });

  it("keeps a hostile asset URL inside the url() string", () => {
    const tokens = themeTokensSchema.parse({
      fonts: { body: { family: "X", files: [{ src: "assets/x.woff2" }] } },
    });
    const css = tokensToCss(tokens, () => 'https://cdn.test/a")};body{color:red');
    assert.doesNotMatch(css, /"\)\};body/);
  });
});
