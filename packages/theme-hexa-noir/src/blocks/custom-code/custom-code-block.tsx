import { useId } from "react";
import { parseBlockConfig } from "@hexapixora/contracts/blocks/define-block";
import { customCodeSchema } from "@hexapixora/contracts/blocks/custom-code";
import { SectionHeading } from "../../components/section-heading";
import { colors } from "../../index";
import { CustomScript } from "./custom-script";

const PADDING: Record<string, string> = {
  none: "py-0",
  small: "py-12",
  medium: "py-section",
  large: "py-[calc(var(--spacing-section)*1.4)]",
};

// Every width stays inside the page column (the 1440px rule); "full" is the column itself.
const WIDTH: Record<string, string> = {
  full: "",
  container: "",
  "max-w-4xl": "max-w-4xl",
  "max-w-6xl": "max-w-6xl",
};

/** A closing tag inside admin CSS must not end our <style> element early. */
const guardStyle = (css: string) => css.replace(/<\/style/gi, "<\/style");

/**
 * Admin-authored HTML, CSS and JS, raw by design (only admins can edit it).
 * Inline mode renders the HTML on the server (visible to search engines) and
 * runs the script after hydration. Iframe mode isolates everything in a
 * sandbox without same-origin access, so the code can't reach this site's
 * cookies or DOM.
 */
export function CustomCodeBlock({ config }: { config?: unknown }) {
  const c = parseBlockConfig(customCodeSchema, config);
  const headingId = useId();
  const instanceId = `custom-code-${headingId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const width = WIDTH[c.containerWidth] ?? "";

  let body;
  if (c.renderMode === "iframe") {
    const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:1rem;font-family:system-ui,-apple-system,sans-serif;color:${colors.bone};background:transparent}${guardStyle(c.css)}</style></head><body>${c.html}<script>(function(){var container=document.body;try{${c.js}}catch(e){console.error(e)}})();</script></body></html>`;
    body = (
      <iframe
        title={c.title || "Embedded content"}
        srcDoc={srcDoc}
        loading="lazy"
        sandbox="allow-scripts allow-forms allow-popups"
        className="block min-h-[300px] w-full border border-line"
      />
    );
  } else {
    // Unscoped selectors are nested under the instance so they can't restyle the page.
    const css = c.css.trim();
    const scopedCss = css ? (css.includes(`#${instanceId}`) ? css : `#${instanceId} {\n${css}\n}`) : "";
    body = (
      <>
        {/* Safe by design: admin-only raw code (see the block contract). */}
        {scopedCss ? <style dangerouslySetInnerHTML={{ __html: guardStyle(scopedCss) }} /> : null}
        <div id={instanceId} data-part="custom-code" dangerouslySetInnerHTML={{ __html: c.html }} />
        {c.js.trim() ? <CustomScript containerId={instanceId} code={c.js} /> : null}
      </>
    );
  }

  return (
    <section
      data-block="custom-code"
      data-variant={c.renderMode}
      aria-labelledby={c.title ? headingId : undefined}
      className={`relative border-t border-line ${PADDING[c.paddingY] ?? PADDING.medium}`}
    >
      <div className="page-width relative">
        <div className={`${width} mx-auto w-full`}>
          <SectionHeading id={headingId} heading={c.title} />
          {body}
        </div>
      </div>
    </section>
  );
}
