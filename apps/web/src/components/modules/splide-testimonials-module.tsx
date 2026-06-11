"use client";

import React, { useEffect, useRef } from "react";
import { splideTestimonialsSchema, SplideTestimonialsProps } from "@/lib/module-schemas/splide-testimonials-schema";

import Splide from "@splidejs/splide";
import "@splidejs/splide/css";
import { Star, Quote } from "lucide-react";





export default function SplideTestimonialsModule({ config }: { config?: SplideTestimonialsProps }) {
  const {
    heading,
    subheading,
    perPage = "3",
    autoplay = true,
    interval = "4000",
    items = []
  } = splideTestimonialsSchema.parse(config || {});

  const splideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!splideRef.current || items.length === 0) return;

    const splide = new Splide(splideRef.current, {
      type: "loop",
      perPage: parseInt(perPage) || 3,
      gap: "2rem",
      autoplay: autoplay,
      interval: parseInt(interval) || 4000,
      arrows: true,
      pagination: true,
      breakpoints: {
        1024: {
          perPage: Math.max(2, (parseInt(perPage) || 3) - 1),
          gap: "1.5rem",
        },
        768: {
          perPage: 1,
          gap: "1rem",
        }
      }
    });

    splide.mount();

    return () => {
      splide.destroy();
    };
  }, [perPage, autoplay, interval, items]);

  if (items.length === 0) {
    return (
      <section className="container py-16">
        <div className="bg-muted/30 border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <p className="font-semibold text-lg text-foreground">Splide Testimonial Slider</p>
          <p className="text-sm mt-1">Please add testimonials in the settings.</p>
        </div>
      </section>
    );
  }

  const renderStars = (ratingStr?: string) => {
    const stars = parseInt(ratingStr || "5") || 5;
    return (
      <div className="flex gap-0.5 text-amber-500">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </div>
    );
  };

  return (
    <section className="py-24 bg-muted/10 overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4">
        {(heading || subheading) && (
          <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
            {heading && <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{heading}</h2>}
            {subheading && <p className="text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div ref={splideRef} className="splide pb-10">
          <div className="splide__track">
            <ul className="splide__list">
              {items.map((item, index) => (
                <li key={index} className="splide__slide h-auto">
                  <div className="bg-card border rounded-3xl p-8 flex flex-col justify-between h-full shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                    {/* Background glow on hover */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        {renderStars(item.rating)}
                        <Quote size={24} className="text-primary/20 group-hover:text-primary/45 transition-colors" />
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed italic text-base">
                        "{item.content || "Awesome collaboration and delivery."}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 border-t pt-6 mt-8">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-primary/10">
                          {item.name?.[0] || "C"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{item.name || "Client Name"}</h4>
                        <p className="text-xs text-muted-foreground">{item.company || "Company"}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
