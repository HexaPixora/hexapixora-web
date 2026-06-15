"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { MessageSquare, Wrench, Briefcase, BookOpen, ArrowRight } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  email: string;
  type?: string;
  status?: string;
  createdAt: string;
};

type Metrics = {
  leads: number | null;
  services: number | null;
  portfolio: number | null;
  blogs: number | null;
};

// Endpoints are inconsistent: some return a bare array, paginated ones return
// { data, total }. Normalize both to a count.
function countOf(payload: any): number | null {
  if (payload == null) return null;
  if (Array.isArray(payload)) return payload.length;
  if (typeof payload.total === "number") return payload.total;
  if (Array.isArray(payload.data)) return payload.data.length;
  return null;
}

const CARDS = [
  { key: "leads", label: "Total Leads", icon: MessageSquare, href: "/admin/leads" },
  { key: "services", label: "Active Services", icon: Wrench, href: "/admin/modules" },
  { key: "portfolio", label: "Portfolio Items", icon: Briefcase, href: "/admin/modules" },
  { key: "blogs", label: "Blog Posts", icon: BookOpen, href: "/admin/blogs" },
] as const;

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    leads: null,
    services: null,
    portfolio: null,
    blogs: null,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/leads", { params: { limit: 5 } }).catch(() => null),
      apiClient.get("/services").catch(() => null),
      apiClient.get("/portfolio").catch(() => null),
      apiClient.get("/blogs", { params: { limit: 1 } }).catch(() => null),
    ]).then(([leadsRes, servicesRes, portfolioRes, blogsRes]) => {
      setMetrics({
        leads: countOf(leadsRes?.data),
        services: countOf(servicesRes?.data),
        portfolio: countOf(portfolioRes?.data),
        blogs: countOf(blogsRes?.data),
      });
      const leads = leadsRes?.data?.data;
      if (Array.isArray(leads)) setRecentLeads(leads.slice(0, 5));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your agency metrics and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const value = metrics[card.key];
          return (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-xl border bg-card text-card-foreground shadow transition-colors hover:border-primary/50"
            >
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{card.label}</h3>
                <card.icon size={16} className="text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
                  ) : value === null ? (
                    "—"
                  ) : (
                    value
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex items-center justify-between p-6 pb-3">
          <h3 className="font-semibold">Recent Leads</h3>
          <Link
            href="/admin/leads"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="px-6 pb-6">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No leads yet.</p>
          ) : (
            <ul className="divide-y">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lead.type && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">{lead.type}</span>
                    )}
                    {lead.status && (
                      <span className="text-xs border px-2 py-0.5 rounded">{lead.status}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
