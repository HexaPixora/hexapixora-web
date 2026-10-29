import { nextJsConfig } from "@hexapixora/eslint-config/next-js";
import { strictRules } from "@hexapixora/eslint-config/base";

/** Rewritten in Phase 3: the transitional warnings are errors here. */
export default [
  ...nextJsConfig,
  strictRules,
  // Not a Next app: there is no pages directory to check links against.
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
];
