import React from "react";
import { ContactForm } from "../../components/contact-form";
import { ContactFormProps } from "@hexapixora/contracts/blocks/contact-form";

export function ContactFormBlock({ config }: { config: ContactFormProps }) {
  // Read on the server and handed to the form; Turnstile site keys are public.
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <ContactForm {...config} turnstileSiteKey={turnstileSiteKey} />
      </div>
    </section>
  );
}
