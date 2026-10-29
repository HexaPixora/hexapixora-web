import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BLOCK_SCHEMAS, isBlockId } from "../library";
import { LEGACY_TYPES, migrateSection, type Section } from "./migrate";

const REMOVED = ["CustomCodeModule", "InstagramReelsModule", "VideoPlayerModule", "YouTubeEmbedModule"];

const run = (type: string, config: Record<string, unknown> = {}, fallback?: Record<string, unknown>) =>
  migrateSection({ id: "s1", type, label: "L", isVisible: true, config }, fallback);

const cfg = (section: Section | null) => {
  assert.ok(section, "expected a section");
  return section.config as Record<string, any>;
};

describe("migrateSection", () => {
  it("converts every old type, with empty config, into a valid library block", () => {
    for (const type of LEGACY_TYPES) {
      if (REMOVED.includes(type)) continue;
      const out = run(type);
      assert.ok(out && isBlockId(out.type), `${type} → ${out?.type}`);
      assert.doesNotThrow(() => BLOCK_SCHEMAS[out.type as keyof typeof BLOCK_SCHEMAS].parse(out.config), type);
      assert.equal(out.id, "s1");
      assert.equal(out.label, "L");
      assert.equal(out.isVisible, true);
    }
  });

  it("drops removed blocks and unknown types, and leaves new types alone", () => {
    for (const type of REMOVED) assert.equal(run(type), null);
    assert.equal(run("NoSuchModule"), null);
    const fresh: Section = { id: "x", type: "hero", config: { layout: "film" } };
    assert.equal(migrateSection(fresh), fresh);
  });

  it("uses the module defaults for an empty old section", () => {
    const c = cfg(run("CTASection", {}, { title: "From defaults", buttonText: "Go", buttonUrl: "/go" }));
    assert.equal(c.heading, "From defaults");
    assert.deepEqual(c.actions, [{ label: "Go", url: "/go", style: "primary" }]);
  });

  it("keeps in-page anchors: own, cinematic, and the old type-based ones", () => {
    assert.equal(cfg(run("OurStoryModule")).anchorId, "our-story");
    assert.equal(cfg(run("LeaderModule")).anchorId, "leadership");
    assert.equal(cfg(run("process-steps")).anchorId, "process");
    assert.equal(cfg(run("ContactFormModule")).anchorId, "contact");
    assert.equal(cfg(run("ServicesSection", { anchorId: "what-we-do" })).anchorId, "what-we-do");
    assert.equal(cfg(run("TimelineModule")).anchorId, "");
  });

  it("does not leak new demo content into moved sections", () => {
    const c = cfg(run("WhyChooseModule", { items: [] }));
    assert.deepEqual(c.items, []);
    assert.equal(cfg(run("statement")).actions.length, 0);
    assert.equal(cfg(run("TimelineModule", { heading: "H" })).label, "");
  });

  it("maps heroes to the right layout and fields", () => {
    const film = cfg(run("film-hero", { titleTop: "Where pixels", titleBottom: "meet logic", variant: "plain" }));
    assert.equal(film.layout, "film");
    assert.equal(film.heading, "Where pixels\nmeet logic");
    assert.equal(film.backdrop, "plain");

    const banner = cfg(
      run("ParallaxBannerModule", { image: "/a.png", intensity: "strong", overlay: "dark", buttonText: "" }),
    );
    assert.equal(banner.layout, "image");
    assert.equal(banner.motion, "strong");
    assert.equal(banner.overlay, "dark");
    assert.deepEqual(banner.actions, []);

    assert.equal(cfg(run("HeroSection")).layout, "type");
    assert.equal(cfg(run("HeroSection", { backgroundImage: "/b.png" })).layout, "image");
    assert.equal(cfg(run("HeroSection")).actions.length, 2);
    assert.equal(cfg(run("WorkHeroModule")).stats.length, 4);
    assert.equal(cfg(run("StoryHeroModule")).note, "Est. 2019");
  });

  it("maps content blocks field by field", () => {
    const about = cfg(run("AboutSection", { highlights: [{ title: "T", description: "D" }] }));
    assert.deepEqual(about.items, [{ title: "T", text: "D" }]);

    const services = cfg(
      run("ServicesSection", {
        items: [{ title: "Web", description: "d", icon: "globe", link: "/web", buttonText: "More" }],
      }),
    );
    assert.equal(services.items[0].url, "/web");
    assert.equal(services.items[0].linkText, "More");

    assert.equal(cfg(run("OurProcessModule", { steps: [{ title: "A", description: "a" }] })).items[0].label, "Step 01");
    assert.match(cfg(run("process-steps")).note, /agreed date/);
    assert.equal(cfg(run("RichTextModule", { lastUpdated: "May 2026" })).note, "May 2026");
    assert.equal(cfg(run("LeaderModule")).text.length > 0, true);
  });

  it("maps lists, media and conversion blocks", () => {
    const dossier = cfg(run("case-files"));
    assert.equal(dossier.items[0].label, "AWARD");
    assert.equal(dossier.headStyle, "chapter");

    const lab = cfg(run("lab", { items: [{ kind: "Game", title: "Antumbra", linkUrl: "https://play.google.com/x" }] }));
    assert.equal(lab.items[0].url, "https://play.google.com/x");
    assert.equal(lab.items[0].label, "Game");

    assert.equal(
      cfg(run("PortfolioSection", { items: [{ title: "P", categories: ["Web", "App"] }] })).items[0].tags,
      "Web, App",
    );
    assert.equal(cfg(run("StatsSection", { stat4Value: "" })).items.length, 3);
    assert.equal(cfg(run("MarqueeModule", { speed: "warp" })).speed, "normal");
    assert.equal(cfg(run("BlogSection", { limit: "12" })).limit, "9");
    assert.equal(cfg(run("GalleryModule", { columns: "7" })).columns, "3");

    const closing = cfg(run("closing-cta"));
    assert.equal(closing.heading, "Your project\nis next.");
    assert.equal(cfg(run("LeadMagnetModule")).layout, "download");
    assert.equal(cfg(run("ContactFormModule", { phoneNumber: "+1 5" })).phone, "+1 5");
  });

  it("falls back to old defaults when a stored config is invalid", () => {
    const c = cfg(run("TimelineModule", { overlay: "neon" }));
    assert.equal(c.heading, "Our Journey");
  });
});
