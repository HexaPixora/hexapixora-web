import React from "react";
import { testimonialsSchema, TestimonialsProps } from "@/lib/module-schemas/testimonials-schema";

import { Quote } from "lucide-react";



export default function TestimonialsModule({ config }: { config?: TestimonialsProps }) {
  const { heading, subheading, backgroundColor, items } = testimonialsSchema.parse(config || {});
  const testimonials = items || [];

  return (
    <section className="py-24 border-y" style={{ backgroundColor: backgroundColor || '#f8fafc' }}>
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((item: any, idx: number) => (
            <div key={idx} className="bg-background rounded-2xl p-8 shadow-sm relative">
              <Quote className="absolute top-6 right-6 text-primary/10 w-12 h-12" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 text-amber-400`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-lg text-muted-foreground italic mb-8 relative z-10 leading-relaxed">
                "{item.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {item.name?.charAt(0) || "C"}
                  </div>
                )}
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  {item.company && <p className="text-xs text-muted-foreground">{item.company}</p>}
                </div>
              </div>
            </div>
          ))}
          
          {testimonials.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-background">
              No testimonials found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
