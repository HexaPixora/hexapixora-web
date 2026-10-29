import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import path from "node:path";

// File names are kebab-case (`hero-block.tsx`, `create-blog.dto.ts`). Dots
// separate kebab segments, so `.spec`, `.dto`, `.module` suffixes pass.
const KEBAB_FILE = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*$/;
// Names that frameworks or tooling dictate.
const ALLOWED_FILES = new Set(["README.md", "LICENSE", "SECURITY.md", "CHANGELOG.md"]);

const conventionsPlugin = {
  rules: {
    "filename-case": {
      meta: {
        type: "suggestion",
        docs: { description: "Require kebab-case file names" },
        messages: { kebab: "File name '{{name}}' should be kebab-case." },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const name = path.basename(context.filename);
            if (ALLOWED_FILES.has(name) || KEBAB_FILE.test(name)) return;
            context.report({ node, messageId: "kebab", data: { name } });
          },
        };
      },
    },
  },
};

/**
 * Rules held at "warn" until the Phase 3 theme and Phase 4 editor rewrites
 * replace the code that still trips them; errors after that. Configs that add
 * presets after the base must append this again so it wins.
 *
 * @type {import("eslint").Linter.Config}
 */
export const transitionalRules = {
  rules: {
    // TypeScript already reports undefined names, including Node globals in
    // config files.
    "no-undef": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-empty": "warn",
  },
};

/**
 * The same rules as errors, for packages already rewritten (Hexa Noir theme,
 * motion). Append after the preset so it wins over transitionalRules.
 *
 * @type {import("eslint").Linter.Config}
 */
export const strictRules = {
  rules: {
    "no-undef": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-empty": "error",
  },
};

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      conventions: conventionsPlugin,
    },
    rules: {
      "conventions/filename-case": "error",
    },
  },
  transitionalRules,
  {
    ignores: ["dist/**"],
  },
];
