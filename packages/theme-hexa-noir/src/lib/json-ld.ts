/** JSON for a <script type="application/ld+json">: `<` is escaped so CMS text can never close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
