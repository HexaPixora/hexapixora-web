// Form posts from the public site (newsletter, leads, unsubscribe). Plain
// fetch to the same-origin /api proxy, so visitors' pages don't carry an HTTP
// library; the admin keeps the axios client in ./browser.

/** A non-2xx answer: the HTTP status plus the API's message, when it sent a string. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly apiMessage: string | undefined,
  ) {
    super(apiMessage ?? `Request failed with status ${status}`);
    this.name = "ApiError";
  }
}

/** POSTs `body` as JSON to `/api${path}` and returns the parsed reply. Network failures throw as they are. */
export async function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { message?: unknown } | null)?.message;
    throw new ApiError(res.status, typeof message === "string" ? message : undefined);
  }
  return data as T;
}
