"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { Button } from "@hexapixora/ui/button";
import { FormAlert } from "./form-alert";

/** Confirms a changed email address with the token from the emailed link. */
export function VerifyEmailStatus({ token }: { token: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;
    apiClient
      .post("/account/verify-email", { token })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "loading") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Confirming…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {state === "ok" ? (
        <FormAlert tone="success">Your email address is updated.</FormAlert>
      ) : (
        <FormAlert tone="error">
          {token ? "This link is invalid or has expired." : "This link is missing its token."} Change the email again
          from your profile to get a new link.
        </FormAlert>
      )}
      <Button asChild size="lg" variant={state === "ok" ? "default" : "outline"} className="h-10 w-full">
        <a href="/admin/profile">Back to profile</a>
      </Button>
    </div>
  );
}
