"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { contactFormSchema, ContactFormProps } from "@/lib/module-schemas/contact-form-schema";
import { COUNTRIES } from "@/lib/countries";

const schema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  message: z.string().min(10, "Please add a few more details (min. 10 characters)"),
  // Honeypot — hidden from real users. Bots that auto-fill every field trip it.
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Shared field styling — glass surface + brand-blue focus.
const fieldClass =
  "h-11 rounded-xl border-white/10 bg-white/[0.03] transition-all focus:border-[#7cc4ff] focus:ring-1 focus:ring-[#7cc4ff]/50";

export default function ContactForm(props: ContactFormProps) {
  const { title, subtitle, emailAddress, phoneNumber } = contactFormSchema.parse(props || {});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const { website, ...lead } = data;
    // Honeypot tripped: pretend success, send nothing.
    if (website && website.trim().length > 0) {
      setSuccess(true);
      reset();
      return;
    }
    try {
      await apiClient.post("/leads", { ...lead, type: "contact" });
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-[0_40px_100px_-40px_rgba(16,147,253,0.45)] ring-1 ring-inset ring-white/10 lg:grid-cols-12">
        {/* Left — info */}
        <div className="relative isolate overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#1093fd]/12 via-[#1093fd]/5 to-transparent p-8 md:p-12 lg:col-span-5 lg:border-b-0 lg:border-r">
          <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 -z-10 h-60 w-60 rounded-full bg-[rgba(16,147,253,0.28)] blur-[90px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-60 w-60 rounded-full bg-[rgba(80,60,220,0.22)] blur-[100px]" />

          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-[#7cc4ff] ring-1 ring-inset ring-white/10">
                <Sparkles size={12} /> Let&apos;s collaborate
              </span>

              <div>
                <h2 className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black leading-[1.15] tracking-tight text-transparent md:text-4xl">
                  {title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
              </div>

              <div className="space-y-5 pt-2">
                {emailAddress && (
                  <a href={`mailto:${emailAddress}`} className="group flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-[#7cc4ff] ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-105">
                      <Mail size={20} />
                    </span>
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email us</span>
                      <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-[#7cc4ff]">{emailAddress}</span>
                    </span>
                  </a>
                )}
                {phoneNumber && (
                  <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`} className="group flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-[#7cc4ff] ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-105">
                      <Phone size={20} />
                    </span>
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Call us</span>
                      <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-[#7cc4ff]">{phoneNumber}</span>
                    </span>
                  </a>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              By submitting this form you agree to our Privacy Policy. We&apos;ll only use your details to respond to your enquiry.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="relative flex flex-col justify-center p-8 md:p-12 lg:col-span-7">
          {success ? (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={40} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold">Message sent — thank you!</h3>
                <p className="text-muted-foreground">
                  We&apos;ve received your enquiry and a member of our team will be in touch shortly.
                </p>
              </div>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-2">
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Honeypot */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website (leave this empty)</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full name *</label>
                  <Input id="name" {...register("name")} placeholder="Your full name" className={fieldClass} />
                  {errors.name && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} /> {errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Work email *</label>
                  <Input id="email" type="email" {...register("email")} placeholder="you@company.com" className={fieldClass} />
                  {errors.email && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} /> {errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-xs text-muted-foreground">(optional)</span></label>
                  <Input id="phone" {...register("phone")} placeholder="e.g. +1 555 123 4567" className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">Country *</label>
                  <select
                    id="country"
                    defaultValue=""
                    {...register("country")}
                    className={`flex w-full px-3 text-sm text-foreground outline-none ${fieldClass}`}
                  >
                    <option value="" disabled>Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                    ))}
                  </select>
                  {errors.country && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} /> {errors.country.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">How can we help? *</label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Tell us about your project, goals, and timeline…"
                  rows={5}
                  className="resize-none rounded-xl border-white/10 bg-white/[0.03] transition-all focus:border-[#7cc4ff] focus:ring-1 focus:ring-[#7cc4ff]/50"
                />
                {errors.message && <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle size={12} /> {errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-gradient-to-b from-[#2a9dff] to-[#1074e0] text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(16,147,253,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(16,147,253,0.95)]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send message <Send size={15} />
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
