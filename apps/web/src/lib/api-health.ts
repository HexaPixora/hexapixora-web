import { apiUrl } from "@hexapixora/sdk/server";

/**
 * Backend health as seen by the proxy, used to switch the whole site into
 * maintenance mode while the API (or its database) is down.
 *
 * MAINTENANCE_MODE: "auto" (default) follows /api/health, "on" forces the
 * maintenance page (planned work), "off" never shows it (e.g. local dev).
 */
export type MaintenanceMode = "auto" | "on" | "off";

export function maintenanceMode(): MaintenanceMode {
  const value = (process.env.MAINTENANCE_MODE || "auto").toLowerCase();
  return value === "on" || value === "off" ? value : "auto";
}

const UP_TTL_MS = 30_000; // healthy answers are reused for 30s
const DOWN_TTL_MS = 5_000; // while down, re-check often so recovery is quick
const PROBE_TIMEOUT_MS = 4_000;
// A probe still pending after this long belongs to a request that never
// finished (e.g. a frozen or cancelled invocation); start a new one instead.
const INFLIGHT_MAX_AGE_MS = 2 * PROBE_TIMEOUT_MS + 1_000;

let cached: { up: boolean; at: number } | null = null;
let inflight: { promise: Promise<boolean>; at: number } | null = null;

async function probeOnce(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/health"), {
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Retry once before declaring the API down, so a single slow or dropped
// response can't flip the whole site into maintenance.
async function probe(): Promise<boolean> {
  return (await probeOnce()) || probeOnce();
}

function refresh(): Promise<boolean> {
  if (!inflight || Date.now() - inflight.at > INFLIGHT_MAX_AGE_MS) {
    const promise = probe().then((up) => {
      cached = { up, at: Date.now() };
      inflight = null;
      return up;
    });
    inflight = { promise, at: Date.now() };
  }
  return inflight.promise;
}

export async function isApiUp(): Promise<boolean> {
  // Once the cached answer expires, wait for a fresh probe. Never refresh in
  // the background: serverless runtimes freeze an invocation after its
  // response is sent, so a pending probe resumes later with its timeout
  // already elapsed and wrongly reports the API as down.
  if (cached && Date.now() - cached.at < (cached.up ? UP_TTL_MS : DOWN_TTL_MS)) {
    return cached.up;
  }
  return refresh();
}
