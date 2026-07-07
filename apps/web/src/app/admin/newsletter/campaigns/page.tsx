"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Send, Mail, TestTube2, Rocket } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { useAuthStore } from "@/stores/use-auth-store";
import { NewsletterTabs } from "@/components/admin/newsletter-tabs";
import TipTapEditor from "@/components/admin/tiptap-editor";
import { Field, PageHeader, TableCard, THead, TH, TBody, TR, TD, EmptyRow, TableSkeleton, StatusPill } from "@/components/admin/ui";

type Campaign = {
  id: string;
  subject: string;
  status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
  recipientCount: number;
  sentCount: number;
  sentAt: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<Campaign["status"], { label: string; cls: string; dot: string }> = {
  DRAFT: { label: "Draft", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  SENDING: { label: "Sending", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  SENT: { label: "Sent", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  FAILED: { label: "Failed", cls: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
};

export default function CampaignsPage() {
  const confirm = useConfirm();
  const userEmail = useAuthStore((s) => s.user?.email);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState<"" | "test" | "send" | "draft">("");

  const fetchCampaigns = async () => {
    try {
      const res = await apiClient.get("/newsletter/campaigns");
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCompose = () => {
    setSubject("");
    setContent("");
    setTestEmail(userEmail || "");
    setOpen(true);
  };

  const validate = () => {
    if (!subject.trim()) return toast.error("Add a subject"), false;
    if (!content.trim() || content === "<p></p>") return toast.error("Write some content"), false;
    return true;
  };

  const sendTest = async () => {
    if (!validate()) return;
    if (!testEmail.trim()) return toast.error("Enter a test email address");
    setBusy("test");
    try {
      await apiClient.post("/newsletter/campaigns/test", { subject, content, to: testEmail.trim() });
      toast.success(`Test sent to ${testEmail.trim()}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't send test");
    } finally {
      setBusy("");
    }
  };

  const saveDraft = async () => {
    if (!validate()) return;
    setBusy("draft");
    try {
      await apiClient.post("/newsletter/campaigns", { subject, content });
      toast.success("Draft saved");
      setOpen(false);
      fetchCampaigns();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't save draft");
    } finally {
      setBusy("");
    }
  };

  const sendToAll = async () => {
    if (!validate()) return;
    const ok = await confirm({
      title: "Send to all subscribers?",
      description: "This will email every active subscriber. This can't be undone.",
      confirmText: "Send now",
    });
    if (!ok) return;
    setBusy("send");
    try {
      const created = await apiClient.post("/newsletter/campaigns", { subject, content });
      const res = await apiClient.post(`/newsletter/campaigns/${created.data.id}/send`);
      toast.success(res.data?.message || "Sending…");
      setOpen(false);
      fetchCampaigns();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't send campaign");
    } finally {
      setBusy("");
    }
  };

  const sendExisting = async (c: Campaign) => {
    const ok = await confirm({
      title: "Send this campaign?",
      description: `"${c.subject}" will be emailed to all active subscribers.`,
      confirmText: "Send now",
    });
    if (!ok) return;
    try {
      const res = await apiClient.post(`/newsletter/campaigns/${c.id}/send`);
      toast.success(res.data?.message || "Sending…");
      fetchCampaigns();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't send campaign");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Newsletter Campaigns" description="Compose and send emails to your subscribers.">
        <Button onClick={openCompose}>
          <Plus size={16} className="mr-2" /> New Campaign
        </Button>
      </PageHeader>

      <NewsletterTabs />

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <TableSkeleton cols={4} />
        </div>
      ) : (
        <TableCard>
          <THead>
            <tr>
              <TH>Subject</TH>
              <TH>Status</TH>
              <TH>Sent</TH>
              <TH align="right">Date</TH>
            </tr>
          </THead>
          <TBody>
            {campaigns.length === 0 ? (
              <EmptyRow colSpan={4} icon={Mail} title="No campaigns yet" hint="Create your first campaign to email your subscribers." />
            ) : (
              campaigns.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium">{c.subject}</TD>
                  <TD><StatusPill style={STATUS_STYLE[c.status] || STATUS_STYLE.DRAFT} /></TD>
                  <TD className="text-sm text-muted-foreground">
                    {c.status === "SENT" || c.status === "SENDING" ? `${c.sentCount}/${c.recipientCount}` : "—"}
                  </TD>
                  <TD align="right" className="text-xs text-muted-foreground">
                    {c.status === "DRAFT" ? (
                      <Button variant="outline" size="sm" onClick={() => sendExisting(c)}>
                        <Send size={13} className="mr-1.5" /> Send
                      </Button>
                    ) : (
                      new Date(c.sentAt || c.createdAt).toLocaleDateString()
                    )}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </TableCard>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field label="Subject">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your newsletter subject line" />
            </Field>
            <Field label="Content">
              <TipTapEditor value={content} onChange={setContent} placeholder="Write your newsletter…" />
            </Field>
            <Field label="Send a test to" hint="Emails a preview (subject prefixed with [TEST]).">
              <div className="flex gap-2">
                <Input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@email.com" />
                <Button variant="outline" onClick={sendTest} disabled={busy === "test"}>
                  <TestTube2 size={15} className="mr-1.5" /> {busy === "test" ? "Sending…" : "Test"}
                </Button>
              </div>
            </Field>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={saveDraft} disabled={busy === "draft"}>
              {busy === "draft" ? "Saving…" : "Save draft"}
            </Button>
            <Button onClick={sendToAll} disabled={busy === "send"}>
              <Rocket size={15} className="mr-1.5" /> {busy === "send" ? "Sending…" : "Send to all"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
