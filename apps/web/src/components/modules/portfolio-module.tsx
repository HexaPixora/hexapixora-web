import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";



export default function PortfolioModule({ config }: { config: any }) {
  const { heading, subheading, items } = config || {};
  const projects = items || [];

  return (
    <section className="py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-[600px]">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
            {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
          </div>
          <Link href="/portfolio" className="inline-flex items-center font-medium hover:text-primary transition-colors">
            View All Projects <ArrowUpRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project: any, idx: number) => {
            const image = project.image;
            
            return (
              <Link key={idx} href="#" className="group block">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted mb-6">
                  {image ? (
                    <img 
                      src={image} 
                      alt={project.title} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {project.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {project.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                </div>
              </Link>
            );
          })}
          
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No portfolio projects found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
