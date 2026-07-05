"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch {
      // Deliberately ignored — we always show the same result (no enumeration).
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>{sent ? "Check your inbox" : "We'll email you a reset link."}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, a
                password reset link is on its way. It expires in 1 hour.
              </p>
              <a href="/login" className="text-sm text-primary hover:underline">Back to sign in</a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
              <Button className="w-full" onClick={submit} disabled={loading || !email}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
              <div className="text-center">
                <a href="/login" className="text-sm text-muted-foreground hover:text-primary">Back to sign in</a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
