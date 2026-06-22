import React from "react";
import ChatbotSettingsForm from "@/components/admin/chatbot-settings-form";
import { PageHeader } from "@/components/admin/ui";

export default function ChatbotSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chatbot AI"
        description={'Configure the "HexaPixora Support AI" widget shown on your website.'}
      />
      <ChatbotSettingsForm />
    </div>
  );
}
