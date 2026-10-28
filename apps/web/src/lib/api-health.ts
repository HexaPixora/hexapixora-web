import { apiUrl } from "./api-url";

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

const UP_TTL_MS = 15_000; // healthy answers are reused for 15s, then refreshed in the background
const DOWN_TTL_MS = 5_000; // while down, re-check often so recovery is quick
const PROBE_TIMEOUT_MS = 4_000;

let cached: { up: boolean; at: number } | null = null;
let inflight: Promise<boolean> | null = null;

async function probe(): Promise<boolean> {
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

function refresh(): Promise<boolean> {
  inflight ??= probe().then((up) => {
    cached = { up, at: Date.now() };
    inflight = null;
    return up;
  });
  return inflight;
}

export async function isApiUp(): Promise<boolean> {
  if (!cached) return refresh();
  const age = Date.now() - cached.at;
  if (cached.up) {
    // Stale-while-revalidate: keep serving while a background probe runs, so
    // normal traffic never waits on the health check.
    if (age >= UP_TTL_MS) void refresh();
    return true;
  }
  return age < DOWN_TTL_MS ? false : refresh();
}
