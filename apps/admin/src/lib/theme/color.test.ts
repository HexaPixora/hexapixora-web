import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDarkColor, lastDeclaration } from "./color";

describe("isDarkColor", () => {
  it("reads the built-in and Paper page colours", () => {
    assert.equal(isDarkColor("#07080c"), true);
    assert.equal(isDarkColor("#f4efe6"), false);
  });

  it("reads short hex and rgb()", () => {
    assert.equal(isDarkColor("#fff"), false);
    assert.equal(isDarkColor("rgb(11 16 32)"), true);
    assert.equal(isDarkColor("rgb(244, 239, 230)"), false);
  });

  it("treats unreadable colours as dark", () => {
    assert.equal(isDarkColor("oklch(0.9 0 0)"), true);
  });
});

describe("lastDeclaration", () => {
  it("returns the last value, as the cascade would", () => {
    const css = ":root{--color-page:#07080c;--color-copy:#fff}\n:root{--color-page:#f4efe6}";
    assert.equal(lastDeclaration(css, "--color-page"), "#f4efe6");
    assert.equal(lastDeclaration(css, "--color-copy"), "#fff");
    assert.equal(lastDeclaration(css, "--color-line"), null);
  });

  it("doesn't match a longer name", () => {
    assert.equal(lastDeclaration(":root{--color-page-raised:#111}", "--color-page"), null);
  });
});
