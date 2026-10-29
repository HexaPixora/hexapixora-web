"use client";

import { useId, useState, type FormEvent } from "react";
import { apiClient } from "@hexapixora/sdk/browser";
import { PILL_CLASS } from "../../../components/safe-link";
import { FIELD_CLASS, LABEL_CLASS } from "../../../lib/form-classes";

/** Name + email form that records a download lead, then offers the file. */
export function LeadMagnetForm({
  resourceTitle,
  resourceUrl,
  buttonText,
}: {
  resourceTitle: string;
  /** Already checked with safeHref on the server; empty when there is none. */
  resourceUrl: string;
  buttonText: string;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: people never see it, bots fill it
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (website) {
      setDone(true);
      return;
    }
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email.");

    setSubmitting(true);
    try {
      await apiClient.post("/leads", {
        name: name.trim(),
        email: email.trim(),
        type: "download",
        message: `Requested resource: ${resourceTitle}`,
      });
      setDone(true);
      if (resourceUrl) window.open(resourceUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="grid content-start gap-4 border border-line p-8">
        <p className="mono text-signal">Done</p>
        <p className="wide text-title font-medium">Your download is ready.</p>
        {resourceUrl ? (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${PILL_CLASS} justify-self-start bg-signal px-5 py-3.5 text-sm text-on-signal`}
          >
            Download now <span aria-hidden="true">↓</span>
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 border border-line p-8">
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor={`${id}-name`} className={LABEL_CLASS}>
          Your name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          className={FIELD_CLASS}
        />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={LABEL_CLASS}>
          Email address
        </label>
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className={FIELD_CLASS}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-signal">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className={`${PILL_CLASS} justify-self-start bg-signal px-6 py-3.5 text-sm text-on-signal disabled:opacity-60`}
      >
        {submitting ? "Sending…" : buttonText}
      </button>
      <p className="text-xs text-copy-dim">We&apos;ll email you occasionally. Unsubscribe anytime.</p>
    </form>
  );
}
