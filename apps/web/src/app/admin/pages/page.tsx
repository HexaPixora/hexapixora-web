"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, LayoutTemplate, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { revalidateCMS } from "@/actions/revalidate";
import { siteUrl } from "@/lib/site-url";
import { useHasPermission } from "@/stores/use-auth-store";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ContentStatus } from "@/components/admin/status-control";
import { Field, PageHeader, TableCard, THead, TH, TBody, TR, TD, RowActions, EmptyRow, TableSkeleton } from "@/components/admin/ui";

type Page = {
  id: string;
  title: string;
  slug: string;
  status?: ContentStatus;
  publishAt?: string | null;
  isHomepage?: boolean;
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

  const setAsHomepage = async (page: Page) => {
    const ok = await confirm({
      title: "Set as homepage?",
      description: `"${page.title}" will be shown at your site root (/). The current homepage, if any, will be replaced.`,
      confirmText: "Set as homepage",
    });
    if (!ok) return;
    try {
      await apiClient.patch(`/pages/${page.id}/homepage`);
      setPages((list) => list.map((p) => ({ ...p, isHomepage: p.id === page.id })));
      // Purge the cached "/" (and page routes) so the new homepage shows immediately.
      await revalidateCMS();
      toast.success(`"${page.title}" is now the homepage`);
    } catch (err: any) {
      toast.error("Failed to set homepage: " + (err.response?.data?.message || err.message));
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
      await revalidateCMS();
      toast.success("Page deleted");
    } catch (err: any) {
      toast.error("Failed to delete page: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Custom Pages" description="Manage dynamically built pages across your website.">
        {canManage && (
          <Button onClick={() => { setNewTitle(""); setCreateOpen(true); }}>
            <Plus size={16} className="mr-2" />
            Create New Page
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <TableSkeleton cols={5} />
        </div>
      ) : (
        <TableCard>
          <THead>
            <tr>
              <TH>Title</TH>
              <TH>URL Slug</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH align="right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {pages.length === 0 ? (
              <EmptyRow
                colSpan={5}
                icon={LayoutTemplate}
                title="No custom pages yet"
                hint="Create a page to start building with modules."
                action={canManage ? (
                  <Button size="sm" onClick={() => { setNewTitle(""); setCreateOpen(true); }}>
                    <Plus size={14} className="mr-1.5" /> Create page
                  </Button>
                ) : undefined}
              />
            ) : (
              pages.map((page) => (
                <TR key={page.id}>
                  <TD>
                    <div className="flex items-center gap-3 font-medium text-foreground">
                      <LayoutTemplate size={16} className="text-primary/70" />
                      {page.title}
                      {page.isHomepage && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          <Home size={10} /> Home
                        </span>
                      )}
                    </div>
                  </TD>
                  <TD className="font-mono text-muted-foreground">/{page.slug}</TD>
                  <TD><StatusBadge status={page.status} publishAt={page.publishAt} /></TD>
                  <TD className="text-muted-foreground">{new Date(page.createdAt).toLocaleDateString()}</TD>
                  <TD align="right">
                    <RowActions>
                      {canManage && (
                        page.isHomepage ? (
                          <span className="rounded-md p-2 text-primary" title="Current homepage">
                            <Home size={16} className="fill-current" />
                          </span>
                        ) : (
                          <button onClick={() => setAsHomepage(page)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="Set as homepage">
                            <Home size={16} />
                          </button>
                        )
                      )}
                      <a href={page.isHomepage ? siteUrl() : siteUrl(page.slug)} target="_blank" rel="noreferrer" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="View Page">
                        <Eye size={16} />
                      </a>
                      <Link href={`/admin/pages/${page.id}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="Edit Page">
                        <Edit size={16} />
                      </Link>
                      {canManage && (
                        <button onClick={() => deletePage(page.id, page.title)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete Page">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </RowActions>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </TableCard>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Field
              label="Page Title"
              hint={newTitle.trim() ? `/${newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}` : undefined}
            >
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newTitle.trim()) createNewPage(); }}
                placeholder="e.g. About Us"
              />
            </Field>
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
