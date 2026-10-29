import { NextRequest, NextResponse } from "next/server";
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

export const config = {
  // Every page. Skips the /api proxy (the maintenance page polls /api/health
  // through it), Next's static/image assets, and files with an extension.
  matcher: ["/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
