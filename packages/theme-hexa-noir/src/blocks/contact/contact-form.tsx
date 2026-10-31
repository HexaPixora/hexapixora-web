"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError, postJson } from "@hexapixora/sdk/post-json";
import { COUNTRIES } from "@hexapixora/contracts/countries";
import { PILL_CLASS } from "../../components/safe-link";
import { trackEvent } from "../../lib/analytics";
import { ERROR_CLASS, FIELD_CLASS, LABEL_CLASS } from "../../lib/form-classes";

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  country: string;
  message: string;
  // Honeypot: people never see it, bots that fill every field trip it.
  website?: string;
};

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const trim = (value: unknown) => (typeof value === "string" ? value.trim() : value);

// The form library's own rules rather than a schema library: the checks are
// simple, and the API validates every lead again on save.
const RULES = {
  name: { setValueAs: trim, validate: (v: string) => v.length >= 2 || "Please enter your full name." },
  email: { setValueAs: trim, validate: (v: string) => EMAIL.test(v) || "Please enter a valid email address." },
  country: { required: "Please select your country." },
  message: {
    setValueAs: trim,
    validate: (v: string) => v.length >= 10 || "Please add a few more details (at least 10 characters).",
  },
} as const;

type TurnstileWindow = Window & {
  turnstile?: {
    render: (el: HTMLElement, options: Record<string, unknown>) => string | undefined;
  };
};

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

/**
 * Loads Cloudflare Turnstile once, when the form comes near the screen (its
 * script is large and most visitors never scroll to the form), and renders
 * the check into `ref`.
 */
function useTurnstile(siteKey: string | undefined, onToken: (token: string | null) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!siteKey || !el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [siteKey, near]);

  useEffect(() => {
    if (!siteKey || !near || !ref.current) return;
    const w = window as TurnstileWindow;
    const render = () => {
      if (!w.turnstile || !ref.current || ref.current.childElementCount > 0) return;
      w.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
      });
    };

    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      if (w.turnstile) render();
      else existing.addEventListener("load", render, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener("load", render, { once: true });
    document.head.appendChild(script);
  }, [siteKey, near, onToken]);

  return ref;
}

/** The enquiry form. Posts a contact lead; spam is stopped by the honeypot and Turnstile. */
export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const id = useId();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useTurnstile(turnstileSiteKey, setTurnstileToken);
  const doneRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // Move focus to the confirmation so screen-reader and keyboard users hear it.
  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  const onSubmit = async ({ website, ...lead }: FormValues) => {
    setError(null);
    if (website?.trim()) {
      setSent(true);
      reset();
      return;
    }
    try {
      await postJson("/leads", {
        ...lead,
        type: "contact",
        turnstileToken: turnstileToken || undefined,
      });
      trackEvent("generate_lead", { form: "contact" });
      setSent(true);
      reset();
      setTurnstileToken(null);
    } catch (err: unknown) {
      setError((err instanceof ApiError && err.apiMessage) || "Something went wrong. Please try again later.");
    }
  };

  if (sent) {
    return (
      <div role="status" className="grid content-start gap-4 border border-line p-8 md:p-12">
        <p className="mono text-signal">Message sent</p>
        <p ref={doneRef} tabIndex={-1} className="wide text-title font-medium outline-none">
          Thank you. We&apos;ll be in touch shortly.
        </p>
        <p className="text-copy-dim">Your enquiry reached us and a member of the crew will reply soon.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className={`${PILL_CLASS} mt-4 justify-self-start border border-copy px-5 py-3.5 text-sm hover:bg-copy hover:text-page`}
        >
          Send another message
        </button>
      </div>
    );
  }

  // Wires a field to its error line for assistive tech.
  const describe = (name: keyof FormValues) =>
    errors[name]
      ? {
          "aria-invalid": true as const,
          "aria-describedby": `${id}-${name}-error`,
        }
      : {};
  const errorLine = (name: keyof FormValues) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className={ERROR_CLASS}>
        {errors[name]?.message}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      data-part="form"
      className="relative grid content-start gap-8 border border-line p-8 md:p-12"
    >
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website (leave this empty)</label>
        <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      {error ? (
        <p role="alert" className="border border-signal px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={LABEL_CLASS}>
            Full name *
          </label>
          <input
            id={`${id}-name`}
            autoComplete="name"
            className={FIELD_CLASS}
            {...describe("name")}
            {...register("name", RULES.name)}
          />
          {errorLine("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={LABEL_CLASS}>
            Work email *
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            className={FIELD_CLASS}
            {...describe("email")}
            {...register("email", RULES.email)}
          />
          {errorLine("email")}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-phone`} className={LABEL_CLASS}>
            Phone (optional)
          </label>
          <input id={`${id}-phone`} type="tel" autoComplete="tel" className={FIELD_CLASS} {...register("phone")} />
        </div>
        <div className="relative">
          <label htmlFor={`${id}-country`} className={LABEL_CLASS}>
            Country *
          </label>
          <select
            id={`${id}-country`}
            defaultValue=""
            autoComplete="country-name"
            className={`${FIELD_CLASS} cursor-pointer appearance-none pr-8`}
            {...describe("country")}
            {...register("country", RULES.country)}
          >
            <option value="" disabled className="bg-page">
              Select your country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country} className="bg-page">
                {country}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className="pointer-events-none absolute right-1 top-[2.15rem] text-copy-dim">
            ↓
          </span>
          {errorLine("country")}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={LABEL_CLASS}>
          How can we help? *
        </label>
        <textarea
          id={`${id}-message`}
          rows={5}
          placeholder="Your project, goals and timeline"
          className={`${FIELD_CLASS} resize-none`}
          {...describe("message")}
          {...register("message", RULES.message)}
        />
        {errorLine("message")}
      </div>

      {turnstileSiteKey ? <div ref={turnstileRef} /> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${PILL_CLASS} justify-self-start bg-signal px-[30px] py-[18px] text-base text-on-signal hover:bg-copy hover:text-page disabled:opacity-60`}
      >
        {isSubmitting ? "Sending…" : "Send message"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
