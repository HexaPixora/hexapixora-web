import { useId } from "react";
import { safeHref } from "@hexapixora/contracts/links";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { portfolioHeroSchema } from "@hexapixora/contracts/blocks/portfolio-hero";
import { ClipReveal } from "@hexapixora/motion/clip-reveal";
import { HeroTitle } from "@hexapixora/motion/hero-title";
import { PillLink } from "../../components/pill-link";
import { SafeLink } from "../../components/safe-link";
import { StatGrid } from "../../components/stat-grid";
import { mediaAlt } from "../../lib/media-alt";

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  twitter: "X",
  x: "X",
};

function socialLabel(platform: string) {
  return SOCIAL_LABELS[platform] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

/** A personal portfolio opener: name, role, bio, skills, buttons, socials, portrait and stats. */
export function PortfolioHeroBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(portfolioHeroSchema, config);
  const titleId = useId();
  const image = safeHref(c.image);
  const skills = c.skills.filter((skill) => skill.label);
  const stats = c.stats.filter((stat) => stat.value || stat.label);
  const ctas = c.ctas.filter((cta) => cta.label);
  const socials = c.socials.filter((social) => social.url && social.url !== "#" && safeHref(social.url));
  const firstName = c.name.trim().split(" ")[0] ?? "";

  if (!c.name && !image) return null;

  return (
    <section
      data-block="portfolio-hero"
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden pb-section pt-[calc(var(--header-h)+64px)]"
    >
      {/* The first name, huge and faint, behind everything. */}
      {firstName ? (
        <span
          aria-hidden="true"
          className="wide pointer-events-none absolute inset-x-0 bottom-0 -z-10 select-none overflow-hidden whitespace-nowrap text-center text-[19vw] font-bold leading-none text-copy/[0.05]"
        >
          {firstName}
        </span>
      ) : null}

      <div className="page-width grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          {c.availability || c.eyebrow ? (
            <p className="mono mb-6 flex flex-wrap gap-x-4 gap-y-1">
              {c.eyebrow ? <span className="text-signal">{c.eyebrow}</span> : null}
              {c.availability ? <span className="text-copy-dim">● {c.availability}</span> : null}
            </p>
          ) : null}
          <HeroTitle id={titleId} className="wide text-display-hero font-medium" lines={[{ text: c.name }]} />
          {c.title ? <p className="mt-4 text-xl font-semibold">{c.title}</p> : null}
          {c.bio ? <p className="mt-5 max-w-[56ch] text-lg text-copy-dim">{c.bio}</p> : null}

          {skills.length > 0 ? (
            <ul aria-label="Skills" className="mono mt-7 flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <li key={i} className="border border-line px-3 py-1.5">
                  {skill.label}
                </li>
              ))}
            </ul>
          ) : null}

          {ctas.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta, i) => (
                <PillLink key={i} href={cta.url} variant={cta.style === "secondary" ? "outline" : "solid"}>
                  {cta.label}
                </PillLink>
              ))}
            </div>
          ) : null}

          {socials.length > 0 ? (
            <ul aria-label="Social links" className="mono mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((social, i) => (
                <li key={i}>
                  <SafeLink href={social.url} className="transition-colors duration-300 hover:text-signal">
                    {socialLabel(social.platform)}
                  </SafeLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {image ? (
          <ClipReveal className="relative aspect-[4/5] overflow-hidden border border-line">
            <img
              src={image}
              alt={mediaAlt(image, c.name)}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </ClipReveal>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <div className="page-width mt-16">
          <StatGrid stats={stats} />
        </div>
      ) : null}
    </section>
  );
}
