import React from "react";
import ChatInbox from "@/components/admin/chat-inbox";
import ChatStats from "@/components/admin/chat-stats";
import { PageHeader } from "@/components/admin/ui";

export default function AdminChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conversations"
        description="Live support chats. Take over from the AI to talk to visitors directly."
      />
      <ChatStats />
      <ChatInbox />
    </div>
  );
}
