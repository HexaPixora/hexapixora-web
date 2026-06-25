import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Enable Next.js Draft Mode so the admin can preview unpublished/scheduled
 * content, then redirect to the target page. Guarded by the shared, server-only
 * PREVIEW_TOKEN — the admin obtains it from the authenticated API
 * (`GET /preview/token`) and the live site never exposes it. While Draft Mode is
 * on, cms-fetch forwards the same token to the API to unlock draft content.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path") || "/";

  const expected = process.env.PREVIEW_TOKEN;
  if (!expected || secret !== expected) {
    return new NextResponse("Invalid preview token", { status: 401 });
  }

  // Only allow internal redirects to avoid an open-redirect via ?path=.
  const safePath = path.startsWith("/") ? path : "/";

  const dm = await draftMode();
  dm.enable();

  // Build the redirect from the Host the browser actually used — NOT
  // request.url. Under `next dev -H 0.0.0.0` request.url reports the bind
  // address (http://0.0.0.0:3000/…), and browsers refuse to load 0.0.0.0.
  // Behind a proxy (Vercel/tunnel) honor x-forwarded-proto so prod works too.
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (/^(localhost|127\.|0\.0\.0\.0|\[?::1\]?)/.test(host) ? "http" : "https");

  return NextResponse.redirect(`${proto}://${host}${safePath}`);
}
