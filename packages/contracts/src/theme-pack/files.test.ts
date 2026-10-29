import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkAsset, classifyPackPath } from "./files";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(parts.flatMap((part) => (typeof part === "string" ? [...part].map((ch) => ch.charCodeAt(0)) : part)));

describe("classifyPackPath", () => {
  it("accepts the pack's own files", () => {
    assert.deepEqual(classifyPackPath("theme.json"), { kind: "manifest" });
    assert.deepEqual(classifyPackPath("theme.css"), { kind: "css" });
    assert.deepEqual(classifyPackPath("assets/space-grotesk.woff2"), { kind: "asset", ext: "woff2" });
    assert.deepEqual(classifyPackPath("assets/photo.jpeg"), { kind: "asset", ext: "jpg" });
  });

  it("rejects traversal, nesting, odd names and risky types", () => {
    for (const path of [
      "../theme.json",
      "/etc/passwd",
      "assets/../../x.png",
      "assets\\x.png",
      "assets/sub/x.png",
      "assets/Upper.png",
      "assets/logo.svg",
      "assets/run.js",
      "index.html",
      "theme.json.bak",
    ]) {
      assert.ok("error" in classifyPackPath(path), path);
    }
  });
});

describe("checkAsset", () => {
  it("accepts files whose bytes match their type", () => {
    assert.deepEqual(checkAsset("assets/a.woff2", "woff2", bytes("wOF2", [0, 1])), { mime: "font/woff2" });
    assert.deepEqual(checkAsset("assets/a.webp", "webp", bytes("RIFF", [1, 2, 3, 4], "WEBP")), { mime: "image/webp" });
    assert.deepEqual(checkAsset("assets/a.avif", "avif", bytes([0, 0, 0, 0x20], "ftypavif")), { mime: "image/avif" });
  });

  it("rejects renamed files and oversized files", () => {
    assert.ok("error" in checkAsset("assets/a.png", "png", bytes("<svg onload=alert(1)>")));
    assert.ok("error" in checkAsset("assets/a.woff2", "woff2", new Uint8Array(2 * 1024 * 1024).fill(0x77)));
  });
});
