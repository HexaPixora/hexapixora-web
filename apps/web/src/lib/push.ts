"use client";

import { apiClient } from "@/lib/api-client";

export type PushState = "unsupported" | "denied" | "subscribed" | "unsubscribed";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Current state without prompting. */
export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub ? "subscribed" : "unsubscribed";
  } catch {
    return "unsubscribed";
  }
}

/** Register the SW, request permission, subscribe, and store it server-side. */
export async function enablePush(): Promise<{ ok: boolean; state: PushState; reason?: string }> {
  if (!pushSupported()) {
    return { ok: false, state: "unsupported", reason: "This browser doesn't support push notifications." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      state: permission === "denied" ? "denied" : "unsubscribed",
      reason: "Notification permission was not granted.",
    };
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const { data } = await apiClient.get("/notifications/vapid-key");
    const key: string = data?.key;
    if (!key) {
      return { ok: false, state: "unsubscribed", reason: "Push isn't configured on the server yet." };
    }

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
    }

    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
    await apiClient.post("/notifications/push/subscribe", { endpoint: json.endpoint, keys: json.keys });
    return { ok: true, state: "subscribed" };
  } catch (err) {
    return { ok: false, state: "unsubscribed", reason: (err as Error)?.message || "Could not enable push." };
  }
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await apiClient.post("/notifications/push/unsubscribe", { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
}
