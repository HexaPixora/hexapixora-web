import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

// Called by the API after content writes so edits show up immediately. Lives
// outside /api, which is rewritten to the API itself.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret");
  if (!secret || !given || !sameSecret(given, secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}

// Hash first so the comparison is constant-time regardless of length.
function sameSecret(a: string, b: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
