import React from "react";

interface YouTubeModuleProps {
  type: string;
  label: string;
  config: {
    videoUrl?: string;
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
    loop?: boolean;
  };
}

// Helper to extract YouTube ID from various URL formats
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : url; // fallback to assuming it's an ID if no match
}

export default function YouTubeModule({ config }: YouTubeModuleProps) {
  const { videoUrl, autoplay, muted, controls, loop } = config;
  const videoId = getYouTubeId(videoUrl || "");

  if (!videoId) {
    return (
      <section className="container py-16 border-b">
        <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
          <p className="font-medium text-lg text-foreground">YouTube Embed</p>
          <p className="text-sm mt-1">Please configure a valid YouTube URL in the module settings.</p>
        </div>
      </section>
    );
  }

  // Construct iframe src with parameters
  let src = `https://www.youtube.com/embed/${videoId}?rel=0`;
  if (autoplay) src += `&autoplay=1`;
  if (muted || autoplay) src += `&mute=1`; // Autoplay requires mute in many browsers
  if (!controls) src += `&controls=0`;
  if (loop) src += `&loop=1&playlist=${videoId}`; // Loop requires playlist param

  return (
    <section className="w-full">
      <div className="container py-16 max-w-5xl mx-auto">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black/5 ring-1 ring-border">
          <iframe
            src={src}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
