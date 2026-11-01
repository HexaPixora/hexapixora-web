"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { Button } from "@hexapixora/ui/button";
import { Field } from "@hexapixora/ui/field";
import { Input } from "@hexapixora/ui/input";
import { useAuthStore } from "@/stores/use-auth-store";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

type LoginValues = { email: string; password: string };

/** A message for a failed sign-in that never echoes server details. */
function loginError(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401) return "That email and password don't match. Check them and try again.";
  if (status === 429) return "Too many attempts. Wait a minute, then try again.";
  if (!status) return "Can't reach the server. Check your connection and try again.";
  return "Something went wrong on our side. Try again in a moment.";
}

/**
 * Sign-in form. `returnTo` is the admin page the visitor was sent away from
 * (already checked to be an /admin path), so they land back where they were.
 */
export function LoginForm({ returnTo }: { returnTo: string }) {
  const { setUser } = useAuthStore();
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>();

  const onSubmit = async (values: LoginValues) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/login", { ...values, email: values.email.trim() });
      setUser(res.data.user);
      setRedirecting(true);
      // Full load so the admin reads the fresh session cookies.
      window.location.href = returnTo;
    } catch (err) {
      setError(loginError(err));
    }
  };

  const busy = isSubmitting || redirecting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}

      <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
        <Input
          id="login-email"
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

      <div>
        <Field label="Password" htmlFor="login-password" error={errors.password?.message}>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            {...register("password", { required: "Enter your password." })}
          />
        </Field>
        <p className="mt-2 text-right">
          <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </a>
        </p>
      </div>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={busy}>
        {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
