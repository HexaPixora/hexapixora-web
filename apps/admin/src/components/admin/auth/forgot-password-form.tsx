"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { Button } from "@hexapixora/ui/button";
import { Field } from "@hexapixora/ui/field";
import { Input } from "@hexapixora/ui/input";
import { FormAlert } from "./form-alert";

/** Asks for a reset link. Always shows the same result, so it can't reveal which emails have accounts. */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    const address = email.trim();
    try {
      await apiClient.post("/auth/forgot-password", { email: address });
    } catch {
      // Deliberately ignored: the answer is the same either way.
    }
    setSentTo(address);
  };

  if (sentTo) {
    return (
      <div className="space-y-6">
        <FormAlert tone="success">
          If an account exists for <span className="font-medium">{sentTo}</span>, a reset link is on its way. It
          expires in 1 hour.
        </FormAlert>
        <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="Email" htmlFor="forgot-email" error={errors.email?.message}>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          className="h-10"
          aria-invalid={errors.email ? true : undefined}
          {...register("email", {
            required: "Enter your email address.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
          })}
        />
      </Field>
      <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
      <p>
        <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to sign in
        </a>
      </p>
    </form>
  );
}
