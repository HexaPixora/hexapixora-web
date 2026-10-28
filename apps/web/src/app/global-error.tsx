"use client";

// Last-resort boundary for failures in the root layout itself. It replaces the
// whole document, so it can't rely on globals.css and styles itself inline.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          background: "#0b0f2e",
          color: "#def0fb",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <main
          style={{
            maxWidth: 560,
            width: "100%",
            background: "#1b2587",
            border: "3px solid #def0fb",
            boxShadow: "6px 6px 0 #ffd23f",
            padding: "32px 24px",
          }}
        >
          <h1 style={{ fontSize: "2rem", lineHeight: 1.15, fontWeight: 900, margin: "0 0 12px" }}>
            Something smudged the ink
          </h1>
          <p style={{ color: "#a9b4d8", margin: "0 0 24px" }}>The site hit a snag while loading.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "2px solid #def0fb",
              background: "#ffd23f",
              color: "#0b0f2e",
              fontWeight: 700,
              padding: "10px 20px",
              boxShadow: "4px 4px 0 #def0fb",
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
