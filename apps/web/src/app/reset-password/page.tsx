"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetInner() {
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
      await apiClient.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "This link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Choose a new password</CardTitle>
        <CardDescription>{done ? "All set" : "Enter and confirm your new password."}</CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <p className="text-center text-sm text-muted-foreground">
            This link is missing its token. Please use the link from your email.
          </p>
        ) : done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">Your password has been updated.</p>
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
              <label className="text-sm font-medium">New password</label>
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
              {loading ? "Updating..." : "Update password"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <ResetInner />
      </Suspense>
    </div>
  );
}
