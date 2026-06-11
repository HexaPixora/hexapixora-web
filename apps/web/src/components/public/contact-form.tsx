"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { contactFormSchema, ContactFormProps } from "@/lib/module-schemas/contact-form-schema";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm(props: ContactFormProps) {
  const {
    title,
    subtitle,
    emailAddress,
    phoneNumber,
    physicalAddress,
  } = contactFormSchema.parse(props || {});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      // POST to the Leads API endpoint
      await apiClient.post("/leads", {
        ...data,
        type: "contact",
      });
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-card/40 backdrop-blur-md border border-muted/30 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-muted/30 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              <Sparkles size={12} />
              <span>Let's collaborate</span>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-muted-foreground bg-clip-text text-transparent mb-4">
                {title}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {emailAddress && (
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-card border border-muted/60 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/50 transition-all shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Us</p>
                    <a href={`mailto:${emailAddress}`} className="text-sm font-semibold hover:text-primary transition-colors">
                      {emailAddress}
                    </a>
                  </div>
                </div>
              )}

              {phoneNumber && (
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-card border border-muted/60 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/50 transition-all shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Call Us</p>
                    <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} className="text-sm font-semibold hover:text-primary transition-colors">
                      {phoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {physicalAddress && (
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-card border border-muted/60 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/50 transition-all shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Visit Us</p>
                    <p className="text-sm font-semibold">
                      {physicalAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-12 lg:pt-0 border-t lg:border-t-0 border-muted/30 mt-8 lg:mt-0">
            <p className="text-xs text-muted-foreground">
              By submitting this form you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center relative">
          {success ? (
            <div className="text-center py-12 px-4 space-y-6 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-bold">Message Sent Successfully!</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. We have received your inquiry and one of our experts will contact you shortly.
                </p>
              </div>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-4">
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                    className="h-11 rounded-xl bg-background/50 border-muted/65 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="h-11 rounded-xl bg-background/50 border-muted/65 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number <span className="text-xs text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+1 (234) 567-890"
                  className="h-11 rounded-xl bg-background/50 border-muted/65 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Your Message *
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder="Tell us about your project or what you need..."
                  rows={5}
                  className="rounded-xl bg-background/50 border-muted/65 focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                    <span>Sending message...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Send Message</span>
                    <Send size={15} />
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
