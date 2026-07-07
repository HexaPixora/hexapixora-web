"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function UnsubscribeInner() {
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This unsubscribe link is missing its token.");
      return;
    }
    apiClient
      .post("/newsletter/unsubscribe", { token })
      .then((r) => {
        setState("ok");
        setMessage(r.data?.message || "You've been unsubscribed.");
      })
      .catch((e) => {
        setState("error");
        setMessage(e.response?.data?.message || "This link is invalid or has expired.");
      });
  }, [token]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Unsubscribe</CardTitle>
        <CardDescription>Managing your newsletter subscription.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {state === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
          {state === "ok" && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
          {state === "error" && <XCircle className="h-10 w-10 text-destructive" />}
          <p className="text-sm text-muted-foreground">{state === "loading" ? "Please wait…" : message}</p>
          {state === "ok" && (
            <p className="text-xs text-muted-foreground">
              Changed your mind? You can subscribe again anytime from our site.
            </p>
          )}
          {state !== "loading" && (
            <a href="/" className="w-full">
              <Button className="w-full" variant="outline">
                Back to site
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <UnsubscribeInner />
      </Suspense>
    </div>
  );
}
