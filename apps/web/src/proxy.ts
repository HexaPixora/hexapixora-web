import { NextRequest, NextResponse } from "next/server";
import { isApiUp, maintenanceMode } from "@/lib/api-health";
import { maintenanceResponse } from "@/lib/maintenance-page";

/**
 * Runs before every page request.
 *
 * 1. Maintenance: while the API is down (or MAINTENANCE_MODE=on) every page
 *    answers with the maintenance page and a 503, so visitors never hit a 404
 *    or a broken render and crawlers know the outage is temporary.
 * 2. Admin guard (defense-in-depth): requests to /admin with no access-token
 *    cookie are redirected to /login before any admin page renders. It does NOT
 *    verify the JWT signature (that requires the secret and happens on the API
 *    via /auth/me). A forged/expired cookie still gets rejected there.
 *
 * (Old nested blog URLs /insights/<cat>/<slug> → flat /insights/<slug> are
 * handled in next.config.js redirects, not here.)
 */
export async function proxy(request: NextRequest) {
  const mode = maintenanceMode();
  if (mode === "on" || (mode === "auto" && !(await isApiUp()))) {
    return maintenanceResponse();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const hasSession = Boolean(request.cookies.get("access_token")?.value);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Every page. Skips the /api proxy (the maintenance page polls /api/health
  // through it), Next's static/image assets, and files with an extension.
  matcher: ["/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
