"use client";

import React, { useEffect, useRef } from "react";
import { splideGallerySyncSchema, SplideGallerySyncProps } from "@/lib/module-schemas/splide-gallery-sync-schema";

import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";





export default function SplideGallerySyncModule({ config }: { config?: SplideGallerySyncProps }) {
  const {
    heading,
    height = "450px",
    items = []
  } = splideGallerySyncSchema.parse(config || {});

  // Bigger main-slide height for a more immersive gallery. A custom CMS value
  // (anything other than the old 450px default) still takes precedence.
  const mainHeight = height && height !== "450px" ? height : "600px";

  const mainRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl || !thumbsRef.current || items.length === 0) return;

    // Primary slider — arrows off; the follow-cursor (below) and thumbnails drive it.
    const mainSplide = new Splide(mainEl, {
      type: "fade",
      rewind: true,
      height: mainHeight,
      pagination: false,
      arrows: false,
      cover: true,
      breakpoints: {
        768: {
          height: "400px",
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

    // Custom follow-cursor: a pointer that trails the mouse across the slider and
    // flips to face left/right depending on the hovered half; clicking that half
    // navigates. Only for fine pointers (desktop) — touch devices use thumbnails.
    let teardownCursor = () => {};
    const cursor = cursorRef.current;
    if (cursor && window.matchMedia("(pointer: fine)").matches) {
      gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
      let dir = 1; // 1 = next (arrow points right), -1 = prev (rotated 180°)
      const onMove = (e: MouseEvent) => {
        const r = mainEl.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
        const nd = e.clientX - r.left > r.width / 2 ? 1 : -1;
        if (nd !== dir) {
          dir = nd;
          gsap.to(cursor, { rotate: dir === 1 ? 0 : 180, duration: 0.25, ease: "power2.out" });
        }
      };
      const onEnter = () => gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" });
      const onLeave = () => gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.3, ease: "power3.out" });
      const onClick = (e: MouseEvent) => {
        const r = mainEl.getBoundingClientRect();
        mainSplide.go(e.clientX - r.left > r.width / 2 ? ">" : "<");
      };
      mainEl.addEventListener("mousemove", onMove);
      mainEl.addEventListener("mouseenter", onEnter);
      mainEl.addEventListener("mouseleave", onLeave);
      mainEl.addEventListener("click", onClick);
      teardownCursor = () => {
        mainEl.removeEventListener("mousemove", onMove);
        mainEl.removeEventListener("mouseenter", onEnter);
        mainEl.removeEventListener("mouseleave", onLeave);
        mainEl.removeEventListener("click", onClick);
      };
    }

    return () => {
      teardownCursor();
      mainSplide.destroy();
      thumbsSplide.destroy();
    };
  }, [mainHeight, items]);

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
      <div className="container px-4">
        {heading && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{heading}</h2>
          </div>
        )}

        {/* Sync Gallery Container */}
        <div className="flex flex-col gap-4">
          
          {/* Main Primary Slider */}
          <div ref={mainRef} className="splide relative overflow-hidden md:cursor-none">
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

            {/* Follow-cursor pointer (desktop) — trails the mouse, flips to the
                hovered half, and that half navigates on click. GSAP-driven. */}
            <div
              ref={cursorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-30 hidden size-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-md md:flex"
            >
              <ArrowRight className="size-6" />
            </div>
          </div>

          {/* Thumbnail Swiper Navigation */}
          <div ref={thumbsRef} className="splide select-none max-w-md mx-auto w-full">
            <div className="splide__track">
              <ul className="splide__list">
                {items.map((item, index) => (
                  <li 
                    key={index} 
                    className="splide__slide aspect-[16/9] overflow-hidden border-2 border-transparent cursor-pointer hover:opacity-90 transition-all opacity-50 splide__slide--nav"
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
