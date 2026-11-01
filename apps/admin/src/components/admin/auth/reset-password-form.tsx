"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { Button } from "@hexapixora/ui/button";
import { Field } from "@hexapixora/ui/field";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

type ResetValues = { password: string; confirm: string };

/** Sets a new password with the token from the emailed link. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>();

  const onSubmit = async ({ password }: ResetValues) => {
    setError("");
    try {
      await apiClient.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 429
          ? "Too many attempts. Wait a minute, then try again."
          : status
            ? "This link is invalid or has expired. Ask for a new one."
            : "Can't reach the server. Check your connection and try again.",
      );
    }
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <FormAlert tone="error">This link is missing its token. Use the link from your email.</FormAlert>
        <a href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
          Ask for a new link
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6">
        <FormAlert tone="success">Your password is updated. You&apos;ve been signed out everywhere else.</FormAlert>
        <Button asChild size="lg" className="h-10 w-full">
          <a href="/login">Sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && (
        <FormAlert tone="error">
          {error}{" "}
          {error.startsWith("This link") && (
            <a href="/forgot-password" className="underline">
              New link
            </a>
          )}
        </FormAlert>
      )}
      <Field label="New password" htmlFor="reset-password" hint="At least 8 characters." error={errors.password?.message}>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          autoFocus
          aria-invalid={errors.password ? true : undefined}
          {...register("password", {
            required: "Enter a new password.",
            minLength: { value: 8, message: "Use at least 8 characters." },
          })}
        />
      </Field>
      <Field label="Confirm password" htmlFor="reset-confirm" error={errors.confirm?.message}>
        <PasswordInput
          id="reset-confirm"
          autoComplete="new-password"
          aria-invalid={errors.confirm ? true : undefined}
          {...register("confirm", {
            validate: (value) => value === getValues("password") || "The passwords don't match.",
          })}
        />
      </Field>
      <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
