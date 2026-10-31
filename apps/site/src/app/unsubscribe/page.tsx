"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, postJson } from "@hexapixora/sdk/post-json";
import { PILL_CLASS } from "@hexapixora/theme-hexa-noir/components/safe-link";

const LABELS = {
  loading: "Working",
  ok: "Unsubscribed",
  error: "Link problem",
} as const;

function UnsubscribeInner() {
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<keyof typeof LABELS>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This unsubscribe link is missing its token.");
      return;
    }
    postJson<{ message?: string }>("/newsletter/unsubscribe", { token })
      .then((r) => {
        setState("ok");
        setMessage(r?.message || "You've been unsubscribed.");
      })
      .catch((e: unknown) => {
        setState("error");
        setMessage((e instanceof ApiError && e.apiMessage) || "This link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div role="status" aria-live="polite" className="grid gap-5">
      <p className="mono text-signal">{LABELS[state]}</p>
      <p className="text-lg text-copy">{state === "loading" ? "Please wait…" : message}</p>
      {state === "ok" ? (
        <p className="text-copy-dim">Changed your mind? You can subscribe again anytime from our site.</p>
      ) : null}
      {state !== "loading" ? (
        <Link
          href="/"
          className={`${PILL_CLASS} mt-4 justify-self-start border border-copy px-5 py-3.5 text-sm hover:bg-copy hover:text-page`}
        >
          Back to site <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main id="main" className="page-width grid min-h-screen content-center py-section">
      <div className="max-w-xl">
        <h1 className="wide mb-10 text-display-md font-medium">Newsletter</h1>
        <Suspense fallback={<p className="mono text-copy-dim">Loading…</p>}>
          <UnsubscribeInner />
        </Suspense>
      </div>
    </main>
  );
}
