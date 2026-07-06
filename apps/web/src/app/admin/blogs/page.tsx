"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Eye, Search, BookOpen } from "lucide-react";
import { useHasPermission } from "@/stores/use-auth-store";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
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

type Blog = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  thumbnail?: string;
  status?: string;
  isPublished?: boolean;
  publishAt?: string;
  publishDate?: string;
  createdAt: string;
};

export default function AdminBlogsPage() {
  const canManage = useHasPermission("blogs");
  const confirm = useConfirm();
  const [data, setData] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (filterPublished === "published") params.published = "true";
      if (filterPublished === "draft") params.published = "false";
      const res = await apiClient.get("/blogs", { params });
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [page, filterPublished]);

  const deletePost = async (blog: Blog) => {
    const ok = await confirm({
      title: "Delete blog post?",
      description: `"${blog.title}" will be permanently deleted. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/blogs/${blog.id}`);
      setData((list) => list.filter((b) => b.id !== blog.id));
      toast.success("Post deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = data.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Insights" description={`${total} posts total`}>
        {canManage && (
          <Button onClick={() => (window.location.href = "/admin/blogs/create")}>
            <Plus size={16} className="mr-2" /> New Post
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilterPublished(f); setPage(1); }}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filterPublished === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
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
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Status</TH>
              <TH>Date</TH>
              <TH align="right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <EmptyRow
                colSpan={5}
                icon={BookOpen}
                title="No posts found"
                hint="Write your first blog post to get started."
                action={canManage ? (
                  <Button size="sm" onClick={() => (window.location.href = "/admin/blogs/create")}>
                    <Plus size={14} className="mr-1.5" /> New Post
                  </Button>
                ) : undefined}
              />
            ) : (
              filtered.map((blog) => (
                <TR key={blog.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {blog.thumbnail && <img src={blog.thumbnail} alt="" className="h-10 w-14 rounded object-cover" />}
                      <div>
                        <p className="font-medium leading-tight">{blog.title}</p>
                        <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    {blog.category ? <Badge variant="secondary">{blog.category}</Badge> : <span className="text-muted-foreground">—</span>}
                  </TD>
                  <TD>
                    <StatusBadge
                      status={(blog.status as any) ?? (blog.isPublished ? "PUBLISHED" : "DRAFT")}
                      publishAt={blog.publishAt}
                    />
                  </TD>
                  <TD className="text-xs text-muted-foreground">
                    {blog.publishDate
                      ? new Date(blog.publishDate).toLocaleDateString()
                      : new Date(blog.createdAt).toLocaleDateString()}
                  </TD>
                  <TD align="right">
                    <RowActions>
                      <a
                        href={siteUrl(`blog/${blog.slug}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Preview"
                      >
                        <Eye size={15} />
                      </a>
                      {canManage && (
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => (window.location.href = `/admin/blogs/${blog.id}/edit`)}>
                          <Pencil size={15} />
                        </Button>
                      )}
                      {canManage && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" title="Delete" onClick={() => deletePost(blog)}>
                          <Trash2 size={15} />
                        </Button>
                      )}
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
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
