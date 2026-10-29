"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@hexapixora/sdk/browser";
import { toast } from "sonner";
import { Button } from "@hexapixora/ui/button";
import { Input } from "@hexapixora/ui/input";
import { SectionCard } from "@hexapixora/ui/admin";
import {
  COLOR_ROLES,
  MOTION_EASES,
  TYPE_STEPS,
  themeTokensSchema,
  type ThemeTokens,
} from "@hexapixora/contracts/theme-pack/schema";
import { tokensToCss } from "@hexapixora/contracts/theme-pack/tokens-to-css";
import { LivePreview } from "./live-preview";
import { TokenGroup, type TokenField } from "./token-group";

export type EditorStart = {
  /** The installed pack being edited; null when starting from the built-in theme. */
  baseId: string | null;
  /** The base pack's compiled CSS (its fonts and theme.css), under the edited tokens. */
  baseCss: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  tokens: ThemeTokens;
};

type Group = "colors" | "type" | "space" | "radius" | "motion";

const title = (key: string) => key.replace(/-/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());
const fields = (keys: readonly string[], hints: Record<string, string> = {}): TokenField[] =>
  keys.map((key) => ({ key, label: title(key), hint: hints[key] }));

const COLOR_FIELDS = fields(COLOR_ROLES, {
  page: "The page background.",
  copy: "Main text.",
  signal: "The accent: buttons, highlights, numbers.",
  "on-signal": "Text on the accent.",
  line: "Hairlines and borders.",
  paper: "Case-file paper.",
});
const TYPE_FIELDS = fields(TYPE_STEPS, { label: "Small labels.", "display-hero": "The page's main heading." });
const SPACE_FIELDS: TokenField[] = [
  { key: "section", label: "Section spacing", hint: "Space above and below each block." },
  { key: "chapter", label: "Chapter spacing", hint: "Under each chapter heading." },
  { key: "page", label: "Page width", hint: "Widest content column." },
];
const RADIUS_FIELDS: TokenField[] = [{ key: "pill", label: "Button corners", hint: "999px for pills, 0 for square." }];
const MOTION_FIELDS = fields(MOTION_EASES);

/** The next patch version: 1.2.3 → 1.2.4. */
export const nextVersion = (version: string) =>
  /^\d+\.\d+\.\d+$/.test(version) ? version.replace(/\d+$/, (n) => String(Number(n) + 1)) : "1.0.0";

/**
 * Edits a theme's tokens with a live preview of the real site, then saves
 * them as a new pack version (plans/phase-3b). Values are checked against the
 * pack schema as you type; an empty field falls back to the built-in value.
 */
export function ThemeEditor({ start }: { start: EditorStart }) {
  const router = useRouter();
  const [tokens, setTokens] = useState<ThemeTokens>(start.tokens);
  const [meta, setMeta] = useState({
    name: start.name,
    slug: start.slug,
    version: start.version,
    description: start.description,
  });
  const [saving, setSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  const checked = useMemo(() => themeTokensSchema.safeParse(tokens), [tokens]);
  const errors = useMemo(() => {
    const byGroup: Record<string, Record<string, string>> = {};
    if (!checked.success) {
      for (const issue of checked.error.issues) {
        const [group, key] = issue.path.map(String);
        if (group && key) (byGroup[group] ??= {})[key] = issue.message;
      }
    }
    return byGroup;
  }, [checked]);

  // CSS only from valid tokens; the last good CSS stays while a value is half-typed.
  const validCss = useMemo(() => {
    if (!checked.success) return null;
    const assetUrl = (path: string) => `/api/themes/assets/${start.baseId}/${path.replace(/^assets\//, "")}`;
    return [start.baseCss, tokensToCss(checked.data, assetUrl)].filter(Boolean).join("\n");
  }, [checked, start.baseCss, start.baseId]);
  const [css, setCss] = useState(validCss ?? start.baseCss);
  useEffect(() => {
    if (validCss !== null) setCss(validCss);
  }, [validCss]);

  const setToken = (group: Group, key: string, value: string) =>
    setTokens((current) => {
      const next = { ...(current[group] as Record<string, string | undefined>) };
      if (value.trim() === "") delete next[key];
      else next[key] = value;
      return { ...current, [group]: next };
    });

  const setFont = (role: string, part: "family" | "fallback", value: string) =>
    setTokens((current) => {
      const fonts = current.fonts as Record<string, { family: string; fallback: string; files: unknown[] }>;
      return { ...current, fonts: { ...fonts, [role]: { ...fonts[role]!, [part]: value } } } as ThemeTokens;
    });

  const save = async () => {
    setSaving(true);
    setSaveErrors([]);
    try {
      const res = await apiClient.post("/themes/versions", {
        ...(start.baseId ? { baseId: start.baseId } : {}),
        ...meta,
        tokens,
      });
      toast.success(res.data?.message ?? "Theme saved");
      router.push("/admin/themes");
    } catch (err) {
      const data = (err as { response?: { data?: { message?: unknown; errors?: unknown } } })?.response?.data;
      const list = Array.isArray(data?.errors) ? data.errors.map(String) : [String(data?.message ?? "Save failed.")];
      setSaveErrors(list);
    } finally {
      setSaving(false);
    }
  };

  const fontRoles = Object.keys(tokens.fonts);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6">
        <SectionCard
          title="Save as"
          description="Saving creates a new version; the theme you started from stays as it is."
          action={
            <Button onClick={save} disabled={saving || !checked.success}>
              {saving ? "Saving…" : "Save new version"}
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {(["name", "slug", "version", "description"] as const).map((key) => (
              <div key={key} className={`space-y-1.5 ${key === "description" ? "sm:col-span-2" : ""}`}>
                <label htmlFor={`meta-${key}`} className="text-sm font-medium">
                  {title(key)}
                </label>
                <Input
                  id={`meta-${key}`}
                  value={meta[key]}
                  onChange={(e) => setMeta({ ...meta, [key]: e.target.value })}
                  className={key === "slug" || key === "version" ? "font-mono text-sm" : ""}
                />
              </div>
            ))}
          </div>
          {!checked.success ? (
            <p className="mt-4 text-sm text-destructive">Fix the values marked below to save.</p>
          ) : null}
          {saveErrors.length ? (
            <ul role="alert" className="mt-4 list-disc space-y-1 pl-5 text-sm text-destructive">
              {saveErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          ) : null}
        </SectionCard>

        <SectionCard title="Colours" description="Hex, rgb(), hsl() or oklch().">
          <TokenGroup
            fields={COLOR_FIELDS}
            values={tokens.colors}
            errors={errors.colors ?? {}}
            colour
            onChange={(key, value) => setToken("colors", key, value)}
          />
        </SectionCard>

        <SectionCard
          title="Fonts"
          description={
            fontRoles.length
              ? "The font files come with the theme; change the names or fallbacks here."
              : "This theme uses the built-in fonts. Add font files by uploading a pack that includes them."
          }
        >
          {fontRoles.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {fontRoles.map((role) => {
                const font = (tokens.fonts as Record<string, { family: string; fallback: string }>)[role]!;
                const roleErrors = errors.fonts ?? {};
                return (
                  <div key={role} className="space-y-1.5 sm:col-span-2">
                    <p className="text-sm font-medium">{title(role)}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={font.family}
                        aria-label={`${role} family`}
                        onChange={(e) => setFont(role, "family", e.target.value)}
                      />
                      <Input
                        value={font.fallback}
                        aria-label={`${role} fallback`}
                        onChange={(e) => setFont(role, "fallback", e.target.value)}
                      />
                    </div>
                    {roleErrors[role] ? <p className="text-xs text-destructive">{roleErrors[role]}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Type sizes" description="A length (1.5rem) or clamp(min, preferred, max).">
          <TokenGroup
            fields={TYPE_FIELDS}
            values={tokens.type}
            errors={errors.type ?? {}}
            onChange={(key, value) => setToken("type", key, value)}
          />
        </SectionCard>

        <SectionCard title="Spacing and shape">
          <div className="space-y-6">
            <TokenGroup
              fields={SPACE_FIELDS}
              values={tokens.space}
              errors={errors.space ?? {}}
              onChange={(key, value) => setToken("space", key, value)}
            />
            <TokenGroup
              fields={RADIUS_FIELDS}
              values={tokens.radius}
              errors={errors.radius ?? {}}
              onChange={(key, value) => setToken("radius", key, value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Motion" description="Easing curves as cubic-bezier(a, b, c, d).">
          <TokenGroup
            fields={MOTION_FIELDS}
            values={tokens.motion}
            errors={errors.motion ?? {}}
            onChange={(key, value) => setToken("motion", key, value)}
          />
        </SectionCard>
      </div>

      <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
        <LivePreview css={css} />
      </div>
    </div>
  );
}
