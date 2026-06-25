"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCMS() {
  try {
    // 'max' forces an immediate purge so on-demand saves reflect right away.
    revalidateTag('layouts', 'max');
    revalidateTag('pages', 'max');
    console.log("Revalidated layouts and pages tags via CMS save");
    return { success: true };
  } catch (err) {
    console.error("Failed to revalidate cache tags:", err);
    return { success: false, error: err };
  }
}
