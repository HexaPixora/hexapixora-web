import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageToRoot, slugify, toPayload } from "./puck-page";
import { sectionsToPuck } from "./puck-sections";

const page = {
  id: "p1",
  title: "About",
  slug: "about",
  showHeader: true,
  showFooter: false,
  status: "SCHEDULED",
  publishAt: "2026-11-01T09:00:00.000Z",
  metaTitle: "About us",
  metaDescription: "Who we are",
  ogImage: "https://example.test/og.png",
};

const section = {
  id: "a",
  type: "hero",
  label: "Top",
  isVisible: true,
  config: { layout: "film", heading: "Hi" },
};

describe("pageToRoot / toPayload", () => {
  it("round-trips the page settings and sections", () => {
    const { content } = sectionsToPuck([section]);
    const payload = toPayload({
      content,
      root: { props: pageToRoot(page) },
    });
    assert.deepEqual(payload, {
      title: "About",
      slug: "about",
      showHeader: true,
      showFooter: false,
      metaTitle: "About us",
      metaDescription: "Who we are",
      ogImage: "https://example.test/og.png",
      status: "SCHEDULED",
      publishAt: "2026-11-01T09:00:00.000Z",
      sections: [section],
    });
  });

  it("fills gaps with the site's defaults", () => {
    const root = pageToRoot({ title: "X", sections: [] });
    assert.equal(root.showHeader, true);
    assert.equal(root.showFooter, true);
    assert.equal(root.metaTitle, "");
    assert.deepEqual(root.publishing, {
      status: "PUBLISHED",
      publishAt: null,
    });
  });

  it("drops the publish time unless the page is scheduled", () => {
    const root = pageToRoot(page);
    const payload = toPayload({
      content: [],
      root: {
        props: { ...root, publishing: { ...root.publishing, status: "DRAFT" } },
      },
    });
    assert.equal(payload.status, "DRAFT");
    assert.equal(payload.publishAt, null);
  });

  it("cleans the slug", () => {
    assert.equal(slugify("Our Work!"), "our-work-");
    const payload = toPayload({
      content: [],
      root: { props: { ...pageToRoot(page), slug: "New Page" } },
    });
    assert.equal(payload.slug, "new-page");
  });
});
