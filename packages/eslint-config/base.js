import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
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
      // Warning while files are migrated (Phase 2); an error once PR 9 lands.
      "conventions/filename-case": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
];
