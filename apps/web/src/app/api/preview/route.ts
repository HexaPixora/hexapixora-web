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

  return NextResponse.redirect(new URL(safePath, request.url));
}
