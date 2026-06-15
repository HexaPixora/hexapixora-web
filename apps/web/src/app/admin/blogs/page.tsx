"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Eye, Search } from "lucide-react";
import { useHasPermission } from "@/stores/use-auth-store";

export default function AdminBlogsPage() {
  const canManage = useHasPermission("blogs");
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const limit = 15;

  const fetchBlogs = async () => {
    const params: any = { page, limit };
    if (filterPublished === "published") params.published = "true";
    if (filterPublished === "draft") params.published = "false";
    const res = await apiClient.get("/blogs", { params });
    setData(res.data.data);
    setTotal(res.data.total);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => { fetchBlogs(); }, [page, filterPublished]);

  const deletePost = async (id: string) => {
    try {
      await apiClient.delete(`/blogs/${id}`);
      setDeleteConfirm(null);
      fetchBlogs();
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filtered = data.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">{total} posts total</p>
        </div>
        {canManage && (
          <Button onClick={() => window.location.href = "/admin/blogs/create"}>
            <Plus size={16} className="mr-2" /> New Post
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilterPublished(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterPublished === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                  <p className="font-medium">No posts found</p>
                  <p className="text-xs mt-1">Create your first blog post!</p>
                </td>
              </tr>
            ) : (
              filtered.map(blog => (
                <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {blog.thumbnail && (
                        <img src={blog.thumbnail} alt="" className="h-10 w-14 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-medium leading-tight">{blog.title}</p>
                        <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {blog.category ? (
                      <Badge variant="secondary">{blog.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${blog.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {blog.publishDate
                      ? new Date(blog.publishDate).toLocaleDateString()
                      : new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Preview">
                        <Eye size={15} />
                      </Button>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => window.location.href = `/admin/blogs/${blog.id}/edit`}
                        >
                          <Pencil size={15} />
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete"
                          onClick={() => setDeleteConfirm(blog.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-lg mb-2">Delete Blog Post</h3>
            <p className="text-muted-foreground text-sm mb-4">This will permanently delete this post. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deletePost(deleteConfirm)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
