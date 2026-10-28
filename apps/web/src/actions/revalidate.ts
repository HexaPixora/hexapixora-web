"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { apiUrl } from "@/lib/api-url";

// Server actions are reachable by anyone who can POST to the site, so confirm
// the caller holds a valid admin session (verified by the API) before purging.
async function hasValidSession(): Promise<boolean> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return false;
  try {
    const res = await fetch(apiUrl("/auth/me"), {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function revalidateCMS() {
  if (!(await hasValidSession())) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    // 'max' forces an immediate purge so on-demand saves reflect right away.
    revalidateTag('layouts', 'max');
    revalidateTag('pages', 'max');
    return { success: true };
  } catch (err) {
    console.error("Failed to revalidate cache tags:", err);
    return { success: false, error: err };
  }
}
