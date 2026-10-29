import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { HEXA_NOIR_TOKENS } from "./hexa-noir";
import { themeTokensSchema } from "./schema";
import { tokensToCss } from "./tokens-to-css";

const themeCss = readFileSync(join(__dirname, "../../../theme-hexa-noir/src/styles/theme.css"), "utf8");

describe("HEXA_NOIR_TOKENS", () => {
  it("passes the pack schema", () => {
    assert.doesNotThrow(() => themeTokensSchema.parse(HEXA_NOIR_TOKENS));
  });

  it("matches every token in the theme's theme.css", () => {
    const declarations = tokensToCss(HEXA_NOIR_TOKENS, (p) => p)
      .replace(/^:root\{|\}$/g, "")
      .split(";")
      .filter(Boolean);
    assert.ok(declarations.length > 30);
    for (const declaration of declarations) {
      const [name, value] = [declaration.slice(0, declaration.indexOf(":")), declaration.slice(declaration.indexOf(":") + 1)];
      assert.ok(themeCss.includes(`${name}: ${value};`), `${name} differs from theme.css`);
    }
  });
});
