import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";



export default function ServicesModule({ config }: { config: any }) {
  const { heading, subheading, items } = config || {};
  const services = items || [];

  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, idx: number) => (
            <div key={idx} className="group relative bg-background border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                {/* Fallback icon if none provided */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {service.description || 'No description provided.'}
              </p>
              <Link href="#" className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
                Read More <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No services found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
