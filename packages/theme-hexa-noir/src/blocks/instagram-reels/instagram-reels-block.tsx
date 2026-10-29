import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { instagramReelsSchema } from "@hexapixora/contracts/blocks/instagram-reels";
import { PillLink } from "../../components/pill-link";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";
import { InstagramEmbeds } from "./instagram-embeds";

/** A canonical Instagram permalink from a URL or bare shortcode, else null. */
function toPermalink(raw: string): string | null {
  const value = raw.trim();
  const match = value.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (match) {
    const type = match[1]!.toLowerCase() === "reels" ? "reel" : match[1]!.toLowerCase();
    return `https://www.instagram.com/${type}/${match[2]}/`;
  }
  return /^[A-Za-z0-9_-]+$/.test(value) ? `https://www.instagram.com/reel/${value}/` : null;
}

/**
 * Instagram reels embedded with Instagram's own player. Each reel is a plain
 * link in the HTML; Instagram's script turns them into players once the page
 * is idle.
 */
export function InstagramReelsBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(instagramReelsSchema, config);
  const headingId = useId();
  const permalinks = c.reels.map((reel) => toPermalink(reel.url)).filter((url): url is string => Boolean(url));
  if (permalinks.length === 0) return null;

  return (
    <SectionFrame block="instagram-reels" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} eyebrow={c.eyebrow} heading={c.heading} subheading={c.subheading} />
      <ul className="flex flex-wrap gap-5">
        {permalinks.map((permalink) => (
          <li key={permalink} className="w-full overflow-hidden border border-line sm:w-[326px]">
            <blockquote className="instagram-media m-0 w-full" data-instgrm-permalink={permalink} data-instgrm-version="14">
              <a href={permalink} rel="noopener noreferrer" className="mono block p-6 hover:text-signal">
                View this reel on Instagram
              </a>
            </blockquote>
          </li>
        ))}
      </ul>
      <InstagramEmbeds />
      {c.ctaLabel && c.ctaUrl ? (
        <div className="mt-12">
          <PillLink href={c.ctaUrl} variant="outline">
            {c.ctaLabel}
          </PillLink>
        </div>
      ) : null}
    </SectionFrame>
  );
}
