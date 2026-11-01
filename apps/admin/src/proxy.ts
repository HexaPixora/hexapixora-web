import { NextRequest, NextResponse } from "next/server";
import { clientIpHeaders } from "@hexapixora/sdk/client-ip-headers";
import { isApiUp, maintenanceMode } from "@hexapixora/sdk/health";
import { maintenanceResponse } from "@hexapixora/theme-hexa-noir/lib/maintenance-page";

/**
 * Runs before every admin page request.
 *
 * 1. Maintenance: the admin is unusable without the API, so it shows the same
 *    maintenance page while /api/health fails (or MAINTENANCE_MODE=on).
 * 2. Admin guard (defense-in-depth): /admin requests with no access-token
 *    cookie redirect to /login before any admin page renders. It does NOT
 *    verify the JWT (the API does, via /auth/me); a forged or expired cookie is
 *    still rejected there.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) return forwardToApi(request);

  const mode = maintenanceMode();
  if (mode === "on" || (mode === "auto" && !(await isApiUp()))) {
    return maintenanceResponse();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!request.cookies.get("access_token")?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
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
