import React from "react";
import ChatInbox from "@/components/admin/chat-inbox";
import ChatStats from "@/components/admin/chat-stats";

export default function AdminChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Live support chats. Take over from the AI to talk to visitors directly.
        </p>
      </div>
      <ChatStats />
      <ChatInbox />
    </div>
  );
}
