import React from "react";
import ChatbotSettingsForm from "@/components/admin/chatbot-settings-form";

export default function ChatbotSettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chatbot AI</h1>
        <p className="text-sm text-muted-foreground">
          Configure the &ldquo;HexaPixora Support AI&rdquo; widget shown on your website.
        </p>
      </div>
      <ChatbotSettingsForm />
    </div>
  );
}
