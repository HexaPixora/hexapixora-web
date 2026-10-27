// Commit messages drive versioning (see RELEASING.md), so PRs must use
// Conventional Commits: feat:, fix:, chore(deps):, feat!: for breaking, etc.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
    // Long URLs / generated notes in bodies are fine; only the header matters.
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
    "subject-case": [0],
  },
};
