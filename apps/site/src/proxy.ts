import { NextResponse } from "next/server";
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
export async function proxy() {
  const mode = maintenanceMode();
  if (mode === "on" || (mode === "auto" && !(await isApiUp()))) {
    return maintenanceResponse();
  }
  return NextResponse.next();
}

export const config = {
  // Every page. Skips the /api proxy (the maintenance page polls /api/health
  // through it), Next's static/image assets, and files with an extension.
  matcher: ["/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
