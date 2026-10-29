import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HIDDEN_PROP,
  LABEL_PROP,
  propsToConfig,
  puckToSections,
  sectionsToPuck,
} from "./puck-sections";

const hero = {
  id: "a",
  type: "hero",
  label: "Top",
  isVisible: true,
  config: { layout: "film", heading: "Hi" },
};
const hiddenText = {
  id: "b",
  type: "text",
  label: "Note",
  isVisible: false,
  config: { layout: "prose", content: "<p>x</p>" },
};

describe("sectionsToPuck / puckToSections", () => {
  it("round-trips library sections unchanged", () => {
    const { content, dropped } = sectionsToPuck([hero, hiddenText]);
    assert.deepEqual(dropped, []);
    assert.deepEqual(puckToSections(content), [hero, hiddenText]);
  });

  it("keeps the section label and visibility apart from the block's own label field", () => {
    const withLabel = {
      ...hero,
      config: { ...hero.config, label: "Small line" },
    };
    const item = sectionsToPuck([withLabel]).content[0]!;
    assert.equal(item.props[LABEL_PROP], "Top");
    assert.equal(item.props.label, "Small line");
    assert.equal(item.props[HIDDEN_PROP], false);
    assert.deepEqual(puckToSections([item]), [withLabel]);
  });

  it("opens old block types as library blocks", () => {
    const old = {
      id: "c",
      type: "CTASection",
      label: "Old",
      isVisible: true,
      config: { title: "Talk", buttonText: "Go", buttonUrl: "/go" },
    };
    const section = puckToSections(sectionsToPuck([old]).content)[0]!;
    assert.equal(section.type, "cta");
    assert.equal(section.config.heading, "Talk");
    assert.equal(section.label, "Old");
  });

  it("reports sections it can't edit instead of failing", () => {
    const unknown = {
      id: "d",
      type: "NoSuchModule",
      isVisible: true,
      config: {},
    };
    const removed = {
      id: "e",
      type: "CustomCodeModule",
      isVisible: true,
      config: { html: "<script>" },
    };
    const { content, dropped } = sectionsToPuck([hero, unknown, removed]);
    assert.equal(content.length, 1);
    assert.deepEqual(dropped, [unknown, removed]);
  });

  it("names unnamed blocks after the block and drops non-library items on save", () => {
    const sections = puckToSections([
      {
        type: "faq",
        props: {
          id: "f",
          [LABEL_PROP]: "  ",
          [HIDDEN_PROP]: false,
          layout: "list",
        },
      },
      { type: "NoSuchModule", props: { id: "g" } },
    ]);
    assert.deepEqual(sections, [
      {
        id: "f",
        type: "faq",
        label: "FAQ",
        isVisible: true,
        config: { layout: "list" },
      },
    ]);
  });

  it("never stores Puck's own render props in a config", () => {
    assert.deepEqual(
      propsToConfig({
        id: "x",
        puck: {},
        editMode: true,
        [LABEL_PROP]: "n",
        [HIDDEN_PROP]: true,
        heading: "h",
      }),
      { heading: "h" },
    );
  });
});
