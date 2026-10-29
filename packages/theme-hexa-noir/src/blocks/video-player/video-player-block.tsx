import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { videoPlayerSchema } from "@hexapixora/contracts/blocks/video-player";
import { SectionFrame } from "../../components/section-frame";
import { SectionHeading } from "../../components/section-heading";

type PlaybackOptions = { autoplay: boolean; loop: boolean; controls: boolean };

/**
 * The embed URL for a YouTube or Vimeo link, or null. Only these two hosts are
 * embedded, so a CMS value can never frame an arbitrary site. YouTube uses its
 * privacy-enhanced domain (no cookies until the visitor plays).
 */
function embedSrc(url: string, { autoplay, loop, controls }: PlaybackOptions): string | null {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  if (youtube?.[1]) {
    const id = youtube[1];
    const params = new URLSearchParams({ rel: "0", playsinline: "1" });
    // Browsers only autoplay muted video.
    if (autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1");
    }
    if (!controls) params.set("controls", "0");
    // Looping a single video needs it listed as its own playlist.
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    const params = new URLSearchParams({ dnt: "1" });
    if (autoplay) {
      params.set("autoplay", "1");
      params.set("muted", "1");
    }
    if (!controls) params.set("controls", "0");
    if (loop) params.set("loop", "1");
    return `https://player.vimeo.com/video/${vimeo[1]}?${params}`;
  }
  return null;
}

/** One featured video, or a grid of videos, embedded lazily. */
export function VideoPlayerBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(videoPlayerSchema, config);
  const headingId = useId();
  const options = { autoplay: c.autoplay, loop: c.loop, controls: c.controls };
  const clips = c.videos
    .map((video) => ({ title: video.title, src: embedSrc(video.videoUrl, options) }))
    .filter((clip): clip is { title: string; src: string } => Boolean(clip.src));
  if (clips.length === 0) return null;
  const shown = c.layout === "single" ? clips.slice(0, 1) : clips;

  return (
    <SectionFrame block="video-player" labelledBy={c.heading ? headingId : undefined}>
      <SectionHeading id={headingId} heading={c.heading} />
      <div className={c.layout === "single" ? "max-w-[1100px]" : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"}>
        {shown.map((clip, i) => (
          <figure key={i}>
            <div className="relative aspect-video overflow-hidden border border-line bg-page-raised">
              <iframe
                src={clip.src}
                title={clip.title || "Embedded video"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {clip.title ? <figcaption className="mono mt-3 text-copy-dim">{clip.title}</figcaption> : null}
          </figure>
        ))}
      </div>
    </SectionFrame>
  );
}
