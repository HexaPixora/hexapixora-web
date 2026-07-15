import React from "react";
import { richTextSchema, RichTextProps } from "@/lib/module-schemas/rich-text-schema";

export default function RichTextModule({ config }: { config?: RichTextProps }) {
  const { heading, lastUpdated, content } = richTextSchema.parse(config || {});

  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[30vh] w-[60vh] -translate-x-1/2 rounded-full bg-[rgba(16,147,253,0.08)] blur-[120px]"
      />

      <div className="container">
        <div className="mx-auto max-w-3xl">
          {heading && (
            <h1 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent md:text-5xl">
              {heading}
            </h1>
          )}
          {lastUpdated && <p className="mt-3 text-sm text-muted-foreground">{lastUpdated}</p>}

          {/* Admin-authored rich text (TipTap). */}
          <div
            className="prose prose-invert prose-lg mt-8 max-w-none break-words text-foreground/90 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#7cc4ff] hover:prose-a:underline prose-strong:text-foreground prose-li:marker:text-[#7cc4ff]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </section>
  );
}
