import { NextRequest, NextResponse } from "next/server";
import { clientIpHeaders } from "@hexapixora/sdk/client-ip-headers";
import { isApiUp, maintenanceMode } from "@hexapixora/sdk/health";
import { maintenanceResponse } from "@hexapixora/theme-hexa-noir/lib/maintenance-page";

/**
 * Runs before every page request. While the API is down (or
 * MAINTENANCE_MODE=on) every page answers with the maintenance page and a 503,
 * so visitors never hit a 404 or a broken render and crawlers know the outage
 * is temporary.
 *
 * The admin lives in its own app (apps/admin); /admin and the auth pages
 * redirect there from next.config.js.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) return forwardToApi(request);

  const mode = maintenanceMode();
  if (mode === "on" || (mode === "auto" && !(await isApiUp()))) {
    return maintenanceResponse();
  }
  return NextResponse.next();
}

/**
 * /api calls pass through to the API (the rewrite in next.config.js) with the
 * visitor's IP attached, so rate limits count per visitor. No maintenance
 * check here: the maintenance page itself polls /api/health.
 */
function forwardToApi(request: NextRequest) {
  return NextResponse.next({ request: { headers: clientIpHeaders(request.headers) } });
}

export const config = {
  // Every page (skipping Next's static/image assets and files with an
  // extension), plus the /api proxy. Uploads (multipart) skip the proxy: it
  // buffers request bodies only up to 10 MB, below the media upload limit, and
  // they come only from signed-in admins.
  matcher: [
    "/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)",
    {
      source: "/api/:path*",
      missing: [{ type: "header", key: "content-type", value: "multipart/form-data.*" }],
    },
  ],
};
