"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Mail } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import {
  PageHeader,
  TableCard,
  THead,
  TH,
  TBody,
  TR,
  TD,
  RowActions,
  EmptyRow,
  TableSkeleton,
  StatusPill,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { NewsletterTabs } from "@/components/admin/newsletter-tabs";

type Subscriber = { id: string; email: string; status: string; createdAt: string };

export default function AdminNewsletterPage() {
  const confirm = useConfirm();
  const [data, setData] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      const res = await apiClient.get("/newsletter/subscribers", { params: { page, limit: 50 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, [page]);

  const deleteSubscriber = async (sub: Subscriber) => {
    const ok = await confirm({
      title: "Remove subscriber?",
      description: `${sub.email}'s subscription record will be permanently deleted.`,
      confirmText: "Remove",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/newsletter/${sub.id}`);
      setData((list) => list.filter((s) => s.id !== sub.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Subscriber removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const exportCSV = () => {
    const csv = ["Email,Status,Subscribed Date",
      ...data.map(s => `${s.email},${s.status},${new Date(s.createdAt).toLocaleDateString()}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = data.filter((d) => d.status === "ACTIVE").length;
  const unsubCount = data.filter((d) => d.status === "UNSUBSCRIBED").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Newsletter Subscribers" description={`${total} total subscribers`}>
        <Button variant="outline" onClick={exportCSV} disabled={data.length === 0}>
          <Download size={15} className="mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <NewsletterTabs />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Subscribers", value: total, cls: "" },
          { label: "Active", value: activeCount, cls: "text-emerald-600 dark:text-emerald-400" },
          { label: "Unsubscribed", value: unsubCount, cls: "text-muted-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 shadow-sm">
            <p className={cn("text-2xl font-bold", stat.cls)}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <TableSkeleton cols={4} />
        </div>
      ) : (
        <TableCard>
          <THead>
            <tr>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Subscribed</TH>
              <TH align="right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {data.length === 0 ? (
              <EmptyRow colSpan={4} icon={Mail} title="No subscribers yet" hint="Subscriptions from the site will appear here." />
            ) : (
              data.map((sub) => (
                <TR key={sub.id}>
                  <TD className="font-medium">{sub.email}</TD>
                  <TD>
                    <StatusPill
                      style={
                        sub.status === "ACTIVE"
                          ? { label: "Active", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
                          : { label: "Unsubscribed", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" }
                      }
                    />
                  </TD>
                  <TD className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</TD>
                  <TD align="right">
                    <RowActions>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteSubscriber(sub)}>
                        <Trash2 size={15} />
                      </Button>
                    </RowActions>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </TableCard>
      )}
    </div>
  );
}
