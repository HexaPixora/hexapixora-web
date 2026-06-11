"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCMS() {
  try {
    revalidateTag('layouts', 'default');
    revalidateTag('pages', 'default');
    console.log("Revalidated layouts and pages tags via CMS save");
    return { success: true };
  } catch (err) {
    console.error("Failed to revalidate cache tags:", err);
    return { success: false, error: err };
  }
}
