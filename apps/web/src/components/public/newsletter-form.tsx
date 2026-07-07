"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { CheckCircle2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | "new" | "already">(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/newsletter/subscribe", { email: email.trim() });
      setDone("new");
    } catch (err: any) {
      if (err?.response?.status === 409) setDone("already");
      else setError(err?.response?.data?.message || "Couldn't subscribe — please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-500">
        <CheckCircle2 size={16} />
        {done === "already" ? "You're already subscribed." : "Thanks — you're subscribed!"}
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={submit}>
      <div className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 bg-foreground/5 border-foreground/15"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "…" : "Subscribe"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
