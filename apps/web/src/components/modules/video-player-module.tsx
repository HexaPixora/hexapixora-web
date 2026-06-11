import React from "react";
import { videoPlayerSchema, VideoPlayerProps } from "@/lib/module-schemas/video-player-schema";






export default function VideoPlayerModule({ config }: { config?: VideoPlayerProps }) {
  const { 
    heading, 
    layout = 'single', 
    autoplay = false, 
    loop = true, 
    controls = true, 
    videos = [] 
  } = videoPlayerSchema.parse(config || {});

  if (!videos || videos.length === 0) {
    return (
      <section className="container py-16">
        <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
          <p className="font-medium text-lg text-foreground">Native Video Player</p>
          <p className="text-sm mt-1">Please upload at least one video in the module settings.</p>
        </div>
      </section>
    );
  }

  // Optimize performance by setting preload strategies
  const renderVideo = (video: any, isHero: boolean) => {
    if (!video.videoUrl) return null;

    return (
      <div className="flex flex-col gap-3 h-full">
        <div className={`relative bg-black/5 ring-1 ring-border rounded-2xl overflow-hidden shadow-xl ${isHero ? 'aspect-video' : 'aspect-[4/3] sm:aspect-video'}`}>
          <video
            src={video.videoUrl}
            poster={video.posterUrl}
            className="w-full h-full object-cover"
            controls={controls}
            autoPlay={autoplay}
            muted={autoplay} // Required for autoplay to work in modern browsers
            loop={loop}
            playsInline
            preload="metadata" // Fast performance: only loads metadata until user plays
          >
            Your browser does not support the video tag.
          </video>
        </div>
        {video.title && (
          <h3 className="font-semibold text-lg px-1">{video.title}</h3>
        )}
      </div>
    );
  };

  return (
    <section className="py-24 bg-background">
      <div className="container max-w-7xl mx-auto">
        {heading && (
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{heading}</h2>
          </div>
        )}

        {layout === 'single' ? (
          // Single Large Video Layout (takes the first video only)
          <div className="max-w-5xl mx-auto">
            {videos[0] && renderVideo(videos[0], true)}
          </div>
        ) : (
          // Grid Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((vid, idx) => (
              <div key={idx} className="h-full">
                {renderVideo(vid, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
