"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Page = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
};

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPages = async () => {
    try {
      const res = await apiClient.get("/pages");
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
    try {
      const newPageTitle = prompt("Enter a title for the new page:");
      if (!newPageTitle) return;

      const slug = newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await apiClient.post("/pages", {
        title: newPageTitle,
        slug: slug,
        sections: "[]",
        showHeader: true,
        showFooter: true
      });

      if (res.data?.data?.id) {
        router.push(`/admin/pages/${res.data.data.id}`);
      }
    } catch (err: any) {
      alert("Failed to create page: " + (err.response?.data?.message || err.message));
    }
  };

  const deletePage = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the page "${title}"? This cannot be undone.`)) {
      try {
        await apiClient.delete(`/pages/${id}`);
        setPages(pages.filter(p => p.id !== id));
      } catch (err: any) {
        alert("Failed to delete page: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom Pages</h1>
          <p className="text-muted-foreground">Manage dynamically built pages across your website.</p>
        </div>
        <Button onClick={createNewPage}>
          <Plus size={16} className="mr-2" />
          Create New Page
        </Button>
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
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`http://localhost:3000/${page.slug}`} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10" title="View Page">
                        <Eye size={16} />
                      </a>
                      <Link href={`/admin/pages/${page.id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10" title="Edit Page">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => deletePage(page.id, page.title)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10" title="Delete Page">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground border-dashed">
                    No custom pages created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
