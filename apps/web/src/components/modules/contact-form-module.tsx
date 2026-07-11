import React from "react";
import ContactForm from "../public/contact-form";
import { contactFormSchema, ContactFormProps } from "@/lib/module-schemas/contact-form-schema";

export default function ContactFormModule({ config }: { config: ContactFormProps }) {
  const { anchorId } = contactFormSchema.parse(config || {});
  return (
    <section id={anchorId || undefined} className="scroll-mt-24 bg-background py-24">
      <div className="container">
        <ContactForm {...config} />
      </div>
    </section>
  );
}
