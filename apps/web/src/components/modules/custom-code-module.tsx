"use client";

import React, { useEffect, useRef, useId } from "react";
import { customCodeSchema, CustomCodeProps } from "@/lib/module-schemas/custom-code-schema";

const PADDING_MAP: Record<string, string> = {
  none: "py-0",
  small: "py-8 md:py-12",
  medium: "py-16 md:py-24",
  large: "py-24 md:py-32",
};

const WIDTH_MAP: Record<string, string> = {
  container: "container",
  "max-w-4xl": "container max-w-4xl",
  "max-w-6xl": "container max-w-6xl",
  full: "w-full px-4 sm:px-6 lg:px-8",
};

export default function CustomCodeModule({ config }: { config?: CustomCodeProps }) {
  const parsed = customCodeSchema.parse(config || {});
  const { title, html, css, js, renderMode, containerWidth, paddingY } = parsed;

  const rawId = useId();
  const instanceId = `custom-code-${rawId.replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);

  // Scoped CSS for inline mode
  const scopedCss = React.useMemo(() => {
    if (!css || !css.trim()) return "";
    // If the CSS already mentions the instance ID or doesn't have selectors, scope it
    const trimmed = css.trim();
    if (trimmed.includes(`#${instanceId}`)) return trimmed;
    
    // Add instance scoping prefix to top-level CSS rules
    return `#${instanceId} {\n${trimmed}\n}`;
  }, [css, instanceId]);

  // Execute custom JavaScript safely when mounted in inline mode
  useEffect(() => {
    if (renderMode !== "inline" || !js || !js.trim() || !containerRef.current) {
      return;
    }

    const containerNode = containerRef.current;
    let cleanupFn: (() => void) | void;

    try {
      // Pass 'container' as a scoped parameter to the custom script
      const scriptFn = new Function("container", "window", "document", js);
      cleanupFn = scriptFn(containerNode, window, document);
    } catch (err) {
      console.error(`[CustomCodeModule] Error executing custom JS script:`, err);
    }

    return () => {
      if (typeof cleanupFn === "function") {
        try {
          cleanupFn();
        } catch (e) {
          console.error(`[CustomCodeModule] Error in custom script cleanup:`, e);
        }
      }
    };
  }, [js, renderMode, html]);

  const paddingClass = PADDING_MAP[paddingY] || PADDING_MAP.medium;
  const widthClass = WIDTH_MAP[containerWidth] || WIDTH_MAP.container;

  if (renderMode === "iframe") {
    const iframeSrcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; color: #fff; background: transparent; }
            ${css || ""}
          </style>
        </head>
        <body>
          ${html || ""}
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              const container = document.body;
              try {
                ${js || ""}
              } catch(e) { console.error("[iFrame JS Error]", e); }
            });
          </script>
        </body>
      </html>
    `;

    return (
      <section className={`relative overflow-hidden ${paddingClass}`}>
        <div className={`mx-auto ${widthClass}`}>
          {title && (
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
          )}
          <iframe
            title={title || "Custom Code Frame"}
            srcDoc={iframeSrcDoc}
            className="w-full border-0 rounded-xl bg-card min-h-[300px]"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden ${paddingClass}`}>
      <div className={`mx-auto ${widthClass}`}>
        {title && (
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
        )}

        {/* Custom scoped styles */}
        {scopedCss && (
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        )}

        {/* Custom HTML container */}
        <div
          id={instanceId}
          ref={containerRef}
          className="custom-code-wrapper relative w-full"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>
    </section>
  );
}
