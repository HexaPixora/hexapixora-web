import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutModule({ config }: { config: any }) {
  const { heading, content, image } = config || {};

  return (
    <section className="py-24 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl">
              {image ? (
                <img 
                  src={image} 
                  alt="About Us" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center border-4 border-dashed rounded-3xl">
                  <p className="text-muted-foreground font-medium">Add Image in Builder</p>
                </div>
              )}
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-full opacity-20 blur-3xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full opacity-20 blur-3xl -z-10"></div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-6 text-primary border-primary/20 bg-primary/10">
              About Us
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              {heading || "Who we are"}
            </h2>
            
            {content && (
              <div className="prose prose-lg dark:prose-invert text-muted-foreground mb-8 max-w-none leading-relaxed">
                {content.split('\n').map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6 mt-4 w-full border-t pt-8">
              <div>
                <h4 className="font-bold text-xl mb-1">Our Mission</h4>
                <p className="text-sm text-muted-foreground">To build scalable digital solutions for modern businesses.</p>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1">Our Vision</h4>
                <p className="text-sm text-muted-foreground">To become the industry standard for enterprise architecture.</p>
              </div>
            </div>
            
            <Link href="/about" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 mt-10">
              Learn More About Us <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
