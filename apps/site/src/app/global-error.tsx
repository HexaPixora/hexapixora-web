"use client";

import { colors } from "@hexapixora/theme-hexa-noir";

// Last-resort boundary for failures in the root layout itself. It replaces the
// whole document, so it can't rely on globals.css and styles itself inline,
// with the Hexa Noir colours from the theme tokens.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          alignContent: "center",
          padding: "24px clamp(20px, 5vw, 64px)",
          background: colors.black,
          color: colors.bone,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <main style={{ maxWidth: 720 }}>
          <p
            style={{
              margin: "0 0 24px",
              color: colors.ember,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Error
          </p>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              lineHeight: 1,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 32px", color: colors.dim, fontSize: 18 }}>The site hit a snag while loading.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              background: colors.ember,
              color: colors.black,
              fontWeight: 800,
              fontSize: 14,
              padding: "14px 22px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
