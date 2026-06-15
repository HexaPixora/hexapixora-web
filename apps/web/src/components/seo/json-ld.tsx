import React from "react";

/**
 * Injects a <script type="application/ld+json"> block with the given
 * structured-data object. Render anywhere in the tree; search engines read it
 * from the static HTML. The payload is serialized server-side.
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own server-built object, not user-controlled markup.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
