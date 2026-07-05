import React from "react";
import { videoPlayerSchema, VideoPlayerProps } from "@/lib/module-schemas/video-player-schema";

type PlaybackOpts = { autoplay: boolean; loop: boolean; controls: boolean };

// Build an embeddable iframe src from a pasted URL. Handles YouTube & Vimeo
// (applying the playback options), and falls back to using an already-embeddable
// URL as-is. Returns null for anything that isn't a usable URL.
function getEmbedSrc(url: string, { autoplay, loop, controls }: PlaybackOpts): string | null {
  if (!url) return null;

  // YouTube (watch / youtu.be / embed / shorts)
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  if (yt?.[1]) {
    const id = yt[1];
    const p = new URLSearchParams({ rel: "0", playsinline: "1" });
    if (autoplay) { p.set("autoplay", "1"); p.set("mute", "1"); } // browsers require mute to autoplay
    if (!controls) p.set("controls", "0");
    if (loop) { p.set("loop", "1"); p.set("playlist", id); } // playlist=self is required for loop
    return `https://www.youtube.com/embed/${id}?${p.toString()}`;
  }

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm?.[1]) {
    const id = vm[1];
    const p = new URLSearchParams();
    if (autoplay) { p.set("autoplay", "1"); p.set("muted", "1"); }
    if (!controls) p.set("controls", "0");
    if (loop) p.set("loop", "1");
    const q = p.toString();
    return `https://player.vimeo.com/video/${id}${q ? `?${q}` : ""}`;
  }

  // Otherwise assume it's already an embeddable URL.
  return /^https?:\/\//.test(url) ? url : null;
}

export default function VideoPlayerModule({ config }: { config?: VideoPlayerProps }) {
  const {
    heading,
    layout = "single",
    autoplay = false,
    loop = true,
    controls = true,
    videos = [],
  } = videoPlayerSchema.parse(config || {});

  const clips = (videos || []).filter((v: any) => v.videoUrl);

  if (clips.length === 0) {
    return (
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-12 text-center ring-1 ring-inset ring-white/10">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
          <p className="text-lg font-semibold text-foreground">Embedded Video</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a YouTube or Vimeo URL in the module settings.</p>
        </div>
      </section>
    );
  }

  const renderVideo = (video: any, isHero: boolean) => {
    const src = getEmbedSrc(video.videoUrl, { autoplay, loop, controls });
    if (!src) return null;

    return (
      <figure className="flex h-full flex-col gap-3">
        {/* Glass frame — layered light on the shell, video kept crisp inside. */}
        <div className="group relative rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-2 shadow-[0_30px_80px_-30px_rgba(16,147,253,0.45)] ring-1 ring-inset ring-white/10 transition-all duration-500 hover:ring-white/25 md:p-3">
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
          <div className={`relative overflow-hidden rounded-[1.4rem] bg-black ${isHero ? "aspect-video" : "aspect-[4/3] sm:aspect-video"}`}>
            <iframe
              src={src}
              title={video.title || "Embedded video"}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
        {video.title && <figcaption className="px-1 text-lg font-semibold text-foreground">{video.title}</figcaption>}
      </figure>
    );
  };

  return (
    <section className="relative isolate overflow-hidden py-24">
      {/* Ambient brand-blue aurora for depth behind the glass. */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[40vh] w-[70vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.12)] blur-[110px]" />

      <div className="container mx-auto max-w-7xl">
        {heading && (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-3xl font-bold leading-[1.3] tracking-tight text-transparent md:text-5xl">
              {heading}
            </h2>
          </div>
        )}

        {layout === "single" ? (
          // Single large video (first clip only)
          <div className="mx-auto max-w-5xl">{clips[0] && renderVideo(clips[0], true)}</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {clips.map((vid, idx) => (
              <div key={idx} className="h-full">{renderVideo(vid, false)}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
