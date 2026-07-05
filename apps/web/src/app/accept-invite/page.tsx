"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AcceptInner() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      await apiClient.post("/account/accept-invite", { token, password });
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "This invite is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Accept your invitation</CardTitle>
        <CardDescription>{done ? "You're all set" : "Set a password to activate your account."}</CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p className="text-center text-sm text-muted-foreground">
            This link is missing its token. Please use the link from your invitation email.
          </p>
        ) : done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">Your account is ready.</p>
            <a href="/login">
              <Button className="w-full">Sign in</Button>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Create a password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading ? "Activating..." : "Activate account"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <AcceptInner />
      </Suspense>
    </div>
  );
}
