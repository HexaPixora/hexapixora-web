import { colors } from "../index";

/**
 * Self-contained maintenance page served by the proxy with a 503 while the API
 * is down. It can't depend on the app (layouts fetch the API), so it ships its
 * own CSS in the Hexa Noir colours and polls /api/health to reload once the
 * backend is back.
 */
const SITE_NAME = process.env.SITE_NAME || "HexaPixora";
const RETRY_AFTER_SECONDS = 30;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="${colors.black}">
<title>Back soon | ${SITE_NAME}</title>
<style>
  :root { --page:${colors.black}; --copy:${colors.bone}; --dim:${colors.dim}; --signal:${colors.ember}; --line:${colors.line}; }
  * { box-sizing:border-box; margin:0; }
  body { min-height:100vh; display:grid; align-content:center; padding:48px clamp(20px,5vw,64px); background:var(--page); color:var(--copy);
    font:18px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  main { width:100%; max-width:1312px; margin:0 auto; }
  .mono { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; letter-spacing:.14em; text-transform:uppercase; }
  .label { color:var(--signal); margin-bottom:24px; }
  h1 { max-width:16ch; font-size:clamp(2.4rem,7vw,5.6rem); line-height:.98; font-weight:600; text-transform:uppercase; letter-spacing:-.01em; }
  .intro { max-width:48ch; margin-top:24px; color:var(--dim); }
  .status { margin-top:40px; display:inline-flex; align-items:center; gap:12px; border:1px solid var(--line); border-radius:999px;
    padding:10px 18px; }
  .dot { width:8px; height:8px; border-radius:50%; background:var(--signal); box-shadow:0 0 12px var(--signal); animation:pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity:.3; } }
  @media (prefers-reduced-motion: reduce) { .dot { animation:none; } }
</style>
</head>
<body>
<main>
  <p class="mono label">Maintenance</p>
  <h1>Back in a moment</h1>
  <p class="intro">${SITE_NAME} is down for a quick update. This page reloads by itself as soon as we&rsquo;re back.</p>
  <div class="status mono" role="status" aria-live="polite"><span class="dot" aria-hidden="true"></span><span id="s">Checking again shortly&hellip;</span></div>
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
