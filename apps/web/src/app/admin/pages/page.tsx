"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { siteUrl } from "@/lib/site-url";
import { useHasPermission } from "@/stores/use-auth-store";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ContentStatus } from "@/components/admin/status-control";

type Page = {
  id: string;
  title: string;
  slug: string;
  status?: ContentStatus;
  publishAt?: string | null;
  createdAt: string;
};

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const confirm = useConfirm();
  const canManage = useHasPermission("pages");

  const fetchPages = async () => {
    try {
      // Admin list includes drafts and scheduled pages.
      const res = await apiClient.get("/pages/admin/list");
      if (res.data?.data) {
        setPages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const createNewPage = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setCreating(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await apiClient.post("/pages", {
        title,
        slug,
        sections: "[]",
        showHeader: true,
        showFooter: true
      });

      if (res.data?.data?.id) {
        setCreateOpen(false);
        setNewTitle("");
        router.push(`/admin/pages/${res.data.data.id}`);
      }
    } catch (err: any) {
      toast.error("Failed to create page: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const deletePage = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Delete page?",
      description: `"${title}" will be permanently deleted. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/pages/${id}`);
      setPages(pages.filter(p => p.id !== id));
      toast.success("Page deleted");
    } catch (err: any) {
      toast.error("Failed to delete page: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Pages</h1>
          <p className="text-muted-foreground">Manage dynamically built pages across your website.</p>
        </div>
        {canManage && (
          <Button onClick={() => { setNewTitle(""); setCreateOpen(true); }}>
            <Plus size={16} className="mr-2" />
            Create New Page
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading pages...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">URL Slug</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 font-medium text-foreground">
                      <LayoutTemplate size={16} className="text-primary/70" />
                      {page.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">
                    /{page.slug}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={page.status} publishAt={page.publishAt} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={siteUrl(page.slug)} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10" title="View Page">
                        <Eye size={16} />
                      </a>
                      <Link href={`/admin/pages/${page.id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10" title="Edit Page">
                        <Edit size={16} />
                      </Link>
                      {canManage && (
                        <button onClick={() => deletePage(page.id, page.title)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10" title="Delete Page">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground border-dashed">
                    No custom pages created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <label className="text-sm font-medium">Page Title</label>
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newTitle.trim()) createNewPage(); }}
              placeholder="e.g. About Us"
            />
            {newTitle.trim() && (
              <p className="text-xs text-muted-foreground font-mono pt-1">
                /{newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createNewPage} disabled={!newTitle.trim() || creating}>
              {creating ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
