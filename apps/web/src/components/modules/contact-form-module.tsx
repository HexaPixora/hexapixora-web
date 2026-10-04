import React from "react";
import ContactForm from "../public/contact-form";
import { ContactFormProps } from "@/lib/module-schemas/contact-form-schema";

export default function ContactFormModule({ config }: { config: ContactFormProps }) {
  const turnstileSiteKey =
    process.env.TURNSTILE_SITE_KEY ||
    process.env.TRUNSTILE_SITE_KEY ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    process.env.NEXT_PUBLIC_TRUNSTILE_SITE_KEY;

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <ContactForm {...config} turnstileSiteKey={turnstileSiteKey} />
      </div>
    </section>
  );
}
