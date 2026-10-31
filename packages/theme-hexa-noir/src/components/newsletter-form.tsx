"use client";

import { useId, useState, type FormEvent } from "react";
import { ApiError, postJson } from "@hexapixora/sdk/post-json";
import { trackEvent } from "../lib/analytics";
import { ERROR_CLASS, FIELD_CLASS } from "../lib/form-classes";

/** The footer sign-up: an optional first name and an email. */
export function NewsletterForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | "new" | "already">(null);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await postJson("/newsletter/subscribe", {
        email: email.trim(),
        ...(name.trim() ? { name: name.trim() } : {}),
      });
      trackEvent("newsletter_signup");
      setDone("new");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) setDone("already");
      else setError((err instanceof ApiError && err.apiMessage) || "Couldn't subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p role="status" className="text-copy">
        <span className="mono mr-2 text-signal">Done</span>
        {done === "already" ? "You're already subscribed." : "Thanks, you're subscribed."}
      </p>
    );
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <label htmlFor={`${id}-name`} className="sr-only">
        First name (optional)
      </label>
      <input
        id={`${id}-name`}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name (optional)"
        autoComplete="given-name"
        className={FIELD_CLASS}
      />
      <div className="flex items-end gap-4">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${FIELD_CLASS} flex-1`}
        />
        <button
          type="submit"
          disabled={loading}
          className="mono shrink-0 py-3 text-signal transition-colors hover:text-copy disabled:opacity-60"
        >
          {loading ? "Sending…" : "Subscribe →"}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className={ERROR_CLASS}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
