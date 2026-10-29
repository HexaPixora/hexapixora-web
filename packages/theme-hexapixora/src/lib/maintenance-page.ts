/**
 * Self-contained maintenance page served by the proxy with a 503 while the API
 * is down. It can't depend on the app (layouts fetch the API), so it ships its
 * own CSS and art, and polls /api/health to reload once the backend is back.
 *
 * Palette and motifs follow the art direction (night-city ink, screentone,
 * speed lines). The panel art is a placeholder until the mascot is drawn.
 */
const SITE_NAME = process.env.SITE_NAME || "HexaPixora";
const RETRY_AFTER_SECONDS = 30;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0b0f2e">
<title>Back soon | ${SITE_NAME}</title>
<style>
  :root { --ink:#0b0f2e; --surface:#1b2587; --paper:#def0fb; --muted:#a9b4d8; --pop:#ffd23f; }
  * { box-sizing:border-box; margin:0; }
  body { min-height:100vh; display:grid; place-items:center; padding:24px 16px; background:var(--ink); color:var(--paper);
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; position:relative; overflow-x:hidden; }
  body::after { content:""; position:fixed; inset:0; pointer-events:none; opacity:.08; mix-blend-mode:screen;
    background-image:radial-gradient(var(--paper) 1px,transparent 1.2px); background-size:12px 12px; }
  .panel { position:relative; z-index:1; width:100%; max-width:560px; background:var(--surface); border:3px solid var(--paper);
    box-shadow:6px 6px 0 var(--pop); padding:32px 24px; text-align:center; }
  .art { width:100%; max-width:280px; height:auto; display:block; margin:0 auto 24px; }
  .art .lines { transform-origin:140px 90px; animation:spin 24s linear infinite; }
  h1 { font-size:clamp(1.75rem,5vw,2.5rem); line-height:1.15; font-weight:900; letter-spacing:-.01em; margin-bottom:12px; }
  p { color:var(--muted); }
  .status { margin-top:24px; display:inline-flex; align-items:center; gap:10px; font-size:.875rem; color:var(--paper);
    border:2px solid var(--paper); padding:6px 14px; }
  .dot { width:10px; height:10px; border-radius:50%; background:var(--pop); animation:pulse 1.6s ease-in-out infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse { 50% { opacity:.3; } }
  @media (prefers-reduced-motion: reduce) { .art .lines, .dot { animation:none; } }
</style>
</head>
<body>
<main class="panel">
  <svg class="art" viewBox="0 0 280 180" role="img" aria-label="A comic panel with speed lines">
    <rect x="4" y="4" width="272" height="172" fill="#0b0f2e" stroke="#def0fb" stroke-width="3"/>
    <g class="lines" stroke="#def0fb" stroke-width="2" stroke-linecap="round" opacity=".55">
      <line x1="140" y1="90" x2="140" y2="-60"/><line x1="140" y1="90" x2="290" y2="-20"/>
      <line x1="140" y1="90" x2="330" y2="90"/><line x1="140" y1="90" x2="290" y2="200"/>
      <line x1="140" y1="90" x2="140" y2="240"/><line x1="140" y1="90" x2="-10" y2="200"/>
      <line x1="140" y1="90" x2="-50" y2="90"/><line x1="140" y1="90" x2="-10" y2="-20"/>
      <line x1="140" y1="90" x2="220" y2="-60"/><line x1="140" y1="90" x2="60" y2="240"/>
    </g>
    <circle cx="140" cy="90" r="38" fill="#1b2587" stroke="#def0fb" stroke-width="3"/>
    <path d="M124 84 q4 -6 8 0 M148 84 q4 -6 8 0" fill="none" stroke="#def0fb" stroke-width="3" stroke-linecap="round"/>
    <path d="M128 102 q12 10 24 0" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>
  </svg>
  <h1>We&rsquo;re inking the next panel</h1>
  <p>${SITE_NAME} is down for a quick update. This page reloads by itself as soon as we&rsquo;re back.</p>
  <div class="status" role="status" aria-live="polite"><span class="dot" aria-hidden="true"></span><span id="s">Checking again shortly&hellip;</span></div>
</main>
<script>
  (function () {
    var s = document.getElementById("s");
    function check() {
      fetch("/api/health", { cache: "no-store" })
        .then(function (r) { if (r.ok) { s.textContent = "We're back, reloading\\u2026"; location.reload(); } else { later(); } })
        .catch(later);
    }
    function later() { s.textContent = "Still working on it\\u2026 checking again shortly"; setTimeout(check, 10000); }
    setTimeout(check, 10000);
  })();
</script>
</body>
</html>`;

export function maintenanceResponse(): Response {
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": String(RETRY_AFTER_SECONDS),
      "X-Robots-Tag": "noindex",
    },
  });
}
