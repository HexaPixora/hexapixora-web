import React from "react";
import { gallerySchema, GalleryProps } from "@/lib/module-schemas/gallery-schema";






export default function GalleryModule({ config }: { config?: GalleryProps }) {
  const { heading, columns = "3", images = [] } = gallerySchema.parse(config || {});

  // Determine grid columns based on config
  const gridColsClass = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-3",
    "4": "md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-3";

  return (
    <section className="py-24 bg-background">
      <div className="container">
        {heading && (
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{heading}</h2>
          </div>
        )}

        {images && images.length > 0 ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-6`}>
            {images.map((img, idx) => {
              if (!img.url) return null;
              return (
                <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-muted/20 aspect-square">
                  <img 
                    src={img.url} 
                    alt={img.caption || `Gallery Image ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {img.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <p className="p-6 text-white font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed rounded-2xl bg-muted/30">
            <p className="text-muted-foreground text-lg">No images in this gallery yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
