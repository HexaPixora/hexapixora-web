"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Trash2, Search, Inbox } from "lucide-react";
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
} from "@/components/admin/ui";
import { LEAD_STATUS } from "@/lib/admin/status-colors";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"];

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  createdAt: string;
};

export default function AdminLeadsPage() {
  const confirm = useConfirm();
  const [data, setData] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await apiClient.get("/leads", { params });
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [page, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/leads/${id}/status`, { status });
      setData((list) => list.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteLead = async (lead: Lead) => {
    const ok = await confirm({
      title: "Delete lead?",
      description: `This inquiry from ${lead.name} will be permanently removed.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/leads/${lead.id}`);
      setData((list) => list.filter((l) => l.id !== lead.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Lead deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = data.filter((l) =>
    `${l.name} ${l.email} ${l.phone || ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Leads & Inquiries" description={`${total} total submissions`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {s === "all" ? "All" : LEAD_STATUS[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <TableSkeleton cols={5} />
        </div>
      ) : (
        <TableCard>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Contact</TH>
              <TH>Message</TH>
              <TH>Status</TH>
              <TH>Date</TH>
              <TH align="right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <EmptyRow colSpan={6} icon={Inbox} title="No leads found" hint="Contact-form submissions will appear here." />
            ) : (
              filtered.map((lead) => (
                <TR key={lead.id}>
                  <TD className="font-medium">{lead.name}</TD>
                  <TD>
                    <div className="flex flex-col gap-1">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Mail size={11} /> {lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                          <Phone size={11} /> {lead.phone}
                        </a>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{lead.message || "—"}</p>
                  </TD>
                  <TD>
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className={cn(
                        "cursor-pointer rounded-full border-none px-2.5 py-1 text-xs font-medium outline-none",
                        LEAD_STATUS[lead.status]?.cls ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{LEAD_STATUS[s]?.label ?? s}</option>)}
                    </select>
                  </TD>
                  <TD className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</TD>
                  <TD align="right">
                    <RowActions>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteLead(lead)}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
