import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/** Exit Draft Mode and return to the given (internal) path. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";
  const safePath = path.startsWith("/") ? path : "/";

  const dm = await draftMode();
  dm.disable();

  return NextResponse.redirect(new URL(safePath, request.url));
}
