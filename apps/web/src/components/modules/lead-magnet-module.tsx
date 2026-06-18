"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { leadMagnetSchema, LeadMagnetProps } from "@/lib/module-schemas/lead-magnet-schema";
import { Download, CheckCircle2, Loader2, FileText } from "lucide-react";

export default function LeadMagnetModule({ config }: { config?: LeadMagnetProps }) {
  const {
    heading, subheading, resourceTitle, resourceUrl, buttonText, coverImage, backgroundColor,
  } = leadMagnetSchema.parse(config || {});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = (hex: string) => {
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex || "")) return true;
    const rgb = parseInt((hex || "").replace("#", ""), 16);
    return 0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >> 8) & 0xff) + 0.0722 * (rgb & 0xff) < 128;
  };
  const dark = isDark(backgroundColor);
  const heat = dark ? "#ffffff" : "#0f172a";
  const muted = dark ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.62)";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (website) { setDone(true); return; } // honeypot tripped — pretend success
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
      // Auto-open the download if we have a file.
      if (resourceUrl) window.open(resourceUrl, "_blank", "noopener");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24" style={{ backgroundColor }}>
      <div className="container">
        <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-3xl border border-muted/30 bg-card/30 p-8 backdrop-blur md:grid-cols-2 md:p-12">
          {/* Left: copy + cover */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <FileText size={12} /> {resourceTitle}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl" style={{ color: heat }}>
              {heading}
            </h2>
            {subheading && <p className="mt-3 text-base" style={{ color: muted }}>{subheading}</p>}
            {coverImage && (
              <img src={coverImage} alt={resourceTitle} className="mt-6 w-full max-w-xs rounded-xl border border-muted/40 shadow-lg" />
            )}
          </div>

          {/* Right: form / success */}
          <div className="rounded-2xl border border-muted/40 bg-background p-6 shadow-xl">
            {done ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 size={44} className="text-green-500" />
                <div>
                  <h3 className="text-lg font-bold">You're all set!</h3>
                  <p className="text-sm text-muted-foreground">Your download is ready.</p>
                </div>
                {resourceUrl && (
                  <a
                    href={resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg"
                  >
                    <Download size={16} /> Download now
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="hidden">
                  <label>Website<input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Your name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                    className="w-full rounded-lg border border-muted/50 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full rounded-lg border border-muted/50 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {buttonText}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  We'll email you occasionally. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
