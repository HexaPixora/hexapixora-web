/** What the renderer passes every library block. */
export type BlockProps = {
  config?: unknown;
  /** True for the page's first section, so a heading can become the page's <h1>. */
  first?: boolean;
  /** Latest posts, loaded by the app for the posts block. */
  posts?: unknown[];
};
