import { icons, Sparkles } from "lucide-react";

// Short names the older blocks stored.
const ALIASES: Record<string, string> = {
  shield: "ShieldCheck",
  trending: "TrendingUp",
  support: "Headphones",
  thumbs: "ThumbsUp",
};

/**
 * An icon chosen by name in the CMS (lucide names, kebab or Pascal case, plus
 * a few short aliases). Rendered on the server as inline SVG, so it costs no
 * client JavaScript. Unknown names fall back to a sparkle.
 */
export function ContentIcon({ name, className }: { name?: string; className?: string }) {
  const key = (name ?? "").trim();
  const pascal = ALIASES[key] ?? key.replace(/(^|[-_\s])(\w)/g, (_m, _sep, ch: string) => ch.toUpperCase());
  const Icon = (icons as Record<string, typeof Sparkles>)[pascal] ?? Sparkles;
  return <Icon aria-hidden="true" strokeWidth={1.75} className={className} />;
}
