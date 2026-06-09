import React from "react";
import SiteLayout from "@/components/public/site-layout";
import ContactForm from "@/components/public/contact-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | HexaPixora Digital Agency",
  description: "Get in touch with HexaPixora. Let's discuss your project, branding, design, or development needs. Reach out for a free quote or consultation.",
};

export default function ContactPage() {
  return (
    <SiteLayout showHeader={true} showFooter={true}>
      <div className="flex-1 flex flex-col justify-center bg-background/50 py-12">
        <ContactForm />
      </div>
    </SiteLayout>
  );
}
