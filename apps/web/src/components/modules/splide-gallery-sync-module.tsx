"use client";

import React, { useEffect, useRef } from "react";
import { splideGallerySyncSchema, SplideGallerySyncProps } from "@/lib/module-schemas/splide-gallery-sync-schema";

import Splide from "@splidejs/splide";
import "@splidejs/splide/css";





export default function SplideGallerySyncModule({ config }: { config?: SplideGallerySyncProps }) {
  const {
    heading,
    height = "450px",
    items = []
  } = splideGallerySyncSchema.parse(config || {});

  const mainRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current || !thumbsRef.current || items.length === 0) return;

    // Initialize Primary Slider
    const mainSplide = new Splide(mainRef.current, {
      type: "fade",
      rewind: true,
      height: height,
      pagination: false,
      arrows: true,
      cover: true,
      breakpoints: {
        768: {
          height: "300px",
        }
      }
    });

    // Initialize Thumbnail Slider
    const thumbsSplide = new Splide(thumbsRef.current, {
      isNavigation: true,
      gap: "0.75rem",
      focus: "center",
      pagination: false,
      arrows: false,
      perPage: Math.min(5, items.length),
      cover: true,
      breakpoints: {
        640: {
          perPage: 3,
        }
      }
    });

    // Sync sliders
    mainSplide.sync(thumbsSplide);

    // Mount both
    mainSplide.mount();
    thumbsSplide.mount();

    return () => {
      mainSplide.destroy();
      thumbsSplide.destroy();
    };
  }, [height, items]);

  if (items.length === 0) {
    return (
      <section className="container py-16">
        <div className="bg-muted/30 border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <p className="font-semibold text-lg text-foreground">Synced Gallery Slider</p>
          <p className="text-sm mt-1">Please add gallery images in the settings.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container max-w-5xl mx-auto px-4 space-y-8">
        {heading && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{heading}</h2>
          </div>
        )}

        {/* Sync Gallery Container */}
        <div className="flex flex-col gap-4">
          
          {/* Main Primary Slider */}
          <div ref={mainRef} className="splide rounded-3xl overflow-hidden shadow-xl border bg-black/5">
            <div className="splide__track">
              <ul className="splide__list">
                {items.map((item, index) => (
                  <li key={index} className="splide__slide relative w-full h-full">
                    {item.image ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center" 
                        style={{ backgroundImage: `url(${item.image})` }} 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Caption Overlays */}
                    {(item.title || item.description) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 text-left text-white z-10">
                        <div className="max-w-2xl space-y-1">
                          {item.title && <h3 className="text-lg font-bold">{item.title}</h3>}
                          {item.description && <p className="text-xs text-slate-200">{item.description}</p>}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Thumbnail Swiper Navigation */}
          <div ref={thumbsRef} className="splide select-none max-w-md mx-auto w-full">
            <div className="splide__track">
              <ul className="splide__list">
                {items.map((item, index) => (
                  <li 
                    key={index} 
                    className="splide__slide aspect-[4/3] rounded-xl overflow-hidden border-2 border-transparent cursor-pointer hover:opacity-90 transition-all opacity-50 splide__slide--nav"
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title || `Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
