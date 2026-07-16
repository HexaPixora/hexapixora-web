import { NextRequest, NextResponse } from "next/server";

/**
 * Edge guard for the admin area. This is defense-in-depth: it blocks the admin
 * shell from being served to requests with no access-token cookie at all, so
 * unauthenticated users are redirected to /login before any admin page renders.
 *
 * It does NOT verify the JWT signature (that requires the secret and happens on
 * the API via /auth/me). A forged/expired cookie still gets rejected there.
 *
 * (Old nested blog URLs /insights/<cat>/<slug> → flat /insights/<slug> are
 * handled in next.config.js redirects, not here.)
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("access_token")?.value);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
