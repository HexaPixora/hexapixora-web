import React from "react";
import ContactForm from "../public/contact-form";
import { ContactFormProps } from "@/lib/module-schemas/contact-form-schema";

export default function ContactFormModule({ config }: { config: ContactFormProps }) {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <ContactForm {...config} />
      </div>
    </section>
  );
}
