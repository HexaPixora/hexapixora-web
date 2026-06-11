import React from "react";
import { teamSchema, TeamProps } from "@/lib/module-schemas/team-schema";

import { Link2 } from "lucide-react";



export default function TeamModule({ config }: { config?: TeamProps }) {
  const { heading, subheading, items } = teamSchema.parse(config || {});
  const teamMembers = items || [];

  return (
    <section className="py-24">
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-[800px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{heading}</h2>
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member: any, idx: number) => (
            <div key={idx} className="group text-center">
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-muted group-hover:border-primary/20 transition-colors">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-4xl text-muted-foreground">
                    {member.name?.charAt(0) || '?'}
                  </div>
                )}
                
                {/* Social Overlay */}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary hover:scale-110 transition-transform">
                      <Link2 size={18} />
                    </a>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-primary font-medium mt-1 mb-3">{member.role}</p>
            </div>
          ))}
          
          {teamMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              No team members found. Add some in the CMS.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
