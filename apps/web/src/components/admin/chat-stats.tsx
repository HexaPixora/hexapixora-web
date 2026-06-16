"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useIsAdmin } from "@/stores/use-auth-store";
import { MessageCircle, CalendarDays, Bot, UserPlus } from "lucide-react";

interface Stats {
  total: number;
  last7Days: number;
  perDayAvg: number;
  humanHandled: number;
  aiOnly: number;
  leadsFromChat: number;
  byDay: { day: string; count: number }[];
}

export default function ChatStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (!isAdmin) return;
    apiClient.get("/chat/admin/stats").then((res) => setStats(res.data)).catch(() => {});
  }, [isAdmin]);

  if (!isAdmin || !stats) return null;
  const resolvedTotal = stats.humanHandled + stats.aiOnly || 1;
  const aiPct = Math.round((stats.aiOnly / resolvedTotal) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat icon={<MessageCircle size={16} />} label="Total chats" value={stats.total} />
      <Stat
        icon={<CalendarDays size={16} />}
        label="Last 7 days"
        value={stats.last7Days}
        sub={`~${stats.perDayAvg}/day`}
      />
      <Stat
        icon={<Bot size={16} />}
        label="AI vs human"
        value={`${aiPct}% AI`}
        sub={`${stats.humanHandled} handled by team`}
      />
      <Stat icon={<UserPlus size={16} />} label="Leads from chat" value={stats.leadsFromChat} />
    </div>
  );
}

function Stat({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span> {label}
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
