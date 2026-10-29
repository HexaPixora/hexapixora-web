import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ComponentConfig, Field } from "@puckeditor/core";
import { BLOCKS, BLOCK_GROUPS } from "@hexapixora/contracts/blocks/library";
import type { ModuleField } from "@hexapixora/contracts/blocks/registry";
import {
  blockFields,
  buildPuckConfig,
  toPuckField,
  type CustomFieldFactory,
} from "./puck-config";
import { HIDDEN_PROP, LABEL_PROP } from "./puck-sections";

const custom: CustomFieldFactory = (field) => ({
  type: "custom",
  label: field.label,
  render: () => null as never,
});
const config = buildPuckConfig({ render: () => null as never, custom });
const component = (id: string) => config.components[id] as ComponentConfig;
const keys = (fields: Record<string, Field>) => Object.keys(fields);
const resolve = (id: string, props: Record<string, unknown>) =>
  component(id).resolveFields!(
    { props: { id: "x", ...props } } as never,
    {} as never,
  ) as Record<string, Field>;

describe("buildPuckConfig", () => {
  it("has every library block, each in one category", () => {
    assert.deepEqual(
      Object.keys(config.components).sort(),
      Object.keys(BLOCKS).sort(),
    );
    const grouped = Object.values(config.categories ?? {}).flatMap(
      (c) => c.components ?? [],
    );
    assert.deepEqual(
      [...grouped].sort(),
      BLOCK_GROUPS.flatMap((g) => g.blocks).sort(),
    );
  });

  it("starts new blocks from the schema defaults, then the saved module defaults", () => {
    const withDefaults = buildPuckConfig({
      render: () => null as never,
      custom,
      defaults: { hero: { heading: "Saved" } },
    });
    const props = withDefaults.components.hero?.defaultProps as Record<
      string,
      unknown
    >;
    assert.equal(props.heading, "Saved");
    assert.equal(props.layout, BLOCKS.hero.defaultConfig.layout);
    assert.equal(props[LABEL_PROP], "Hero");
    assert.equal(props[HIDDEN_PROP], false);
  });

  it("shows only the fields the chosen layout uses", () => {
    const film = keys(resolve("hero", { layout: "film" }));
    const image = keys(resolve("hero", { layout: "image" }));
    assert.ok(film.includes("backdrop") && !image.includes("backdrop"));
    assert.ok(image.includes("image") && image.includes("motion"));
    assert.ok(!film.includes("image") && !film.includes("motion"));
    for (const fields of [film, image])
      assert.ok(fields.includes(LABEL_PROP) && fields.includes(HIDDEN_PROP));
  });

  it("filters list item fields by layout too", () => {
    for (const [id, def] of Object.entries(BLOCKS)) {
      for (const list of def.fields.filter((f) => f.type === "list")) {
        for (const item of list.itemFields ?? []) {
          if (!item.showFor) continue;
          const other = def.fields
            .find((f) => f.name === "layout")
            ?.options?.find((o) => !item.showFor!.includes(o.value));
          if (!other) continue;
          const shown = resolve(id, { layout: item.showFor[0] })[list.name];
          const hidden = resolve(id, { layout: other.value })[list.name];
          if (shown?.type === "array")
            assert.ok(
              item.name in shown.arrayFields,
              `${id}.${list.name}.${item.name}`,
            );
          if (hidden?.type === "array")
            assert.ok(
              !(item.name in hidden.arrayFields),
              `${id}.${list.name}.${item.name}`,
            );
        }
      }
    }
  });
});

describe("toPuckField", () => {
  it("maps each field type to a Puck control", () => {
    const f = (type: ModuleField["type"], extra: Partial<ModuleField> = {}) =>
      toPuckField({ name: "n", label: "Items", type, ...extra }, "x", custom);
    assert.equal(f("text").type, "text");
    assert.equal(f("textarea").type, "textarea");
    assert.equal(
      f("select", { options: [{ label: "A", value: "a" }] }).type,
      "select",
    );
    assert.deepEqual(
      (f("boolean") as { options: unknown[] }).options.map(
        (o) => (o as { value: boolean }).value,
      ),
      [true, false],
    );
    for (const type of ["image", "video", "richtext", "categories"] as const)
      assert.equal(f(type).type, "custom");
  });

  it("gives new list items sensible defaults and a readable summary", () => {
    const list = toPuckField(
      {
        name: "items",
        label: "Cards",
        type: "list",
        itemFields: [
          { name: "title", label: "Title", type: "text" },
          {
            name: "style",
            label: "Style",
            type: "select",
            options: [{ label: "P", value: "primary" }],
          },
          { name: "on", label: "On", type: "boolean" },
        ],
      },
      "grid",
      custom,
    );
    assert.equal(list.type, "array");
    if (list.type !== "array") return;
    assert.deepEqual(list.defaultItemProps, {
      title: "",
      style: "primary",
      on: false,
    });
    assert.equal(list.getItemSummary?.({ title: "  Fast  " }, 0), "Fast");
    assert.equal(list.getItemSummary?.({ title: "" }, 2), "Card 3");
  });

  it("never offers a field the block doesn't define", () => {
    for (const def of Object.values(BLOCKS)) {
      const names = new Set(def.fields.map((f) => f.name));
      for (const name of keys(
        blockFields(def, def.defaultConfig.layout, custom),
      )) {
        assert.ok(
          names.has(name) || name === LABEL_PROP || name === HIDDEN_PROP,
          `${def.type}.${name}`,
        );
      }
    }
  });
});
