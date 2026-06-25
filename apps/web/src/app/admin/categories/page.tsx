"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { useHasPermission } from "@/stores/use-auth-store";
import {
  Field, PageHeader, TableCard, THead, TH, TBody, TR, TD, RowActions, EmptyRow, TableSkeleton,
} from "@/components/admin/ui";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  _count?: { blogs: number };
};

type FormState = { name: string; slug: string; description: string; color: string };
const EMPTY: FormState = { name: "", slug: "", description: "", color: "" };

const previewSlug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export default function CategoriesAdminPage() {
  const canManage = useHasPermission("categories");
  const confirm = useConfirm();

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await apiClient.get("/categories");
      setItems(res.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", color: c.color || "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        color: form.color.trim() || undefined,
      };
      if (editingId) {
        await apiClient.patch(`/categories/${editingId}`, payload);
        toast.success("Category updated");
      } else {
        await apiClient.post("/categories", payload);
        toast.success("Category created");
      }
      setOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    const ok = await confirm({
      title: "Delete category?",
      description: `"${c.name}" will be removed from all posts that use it. The posts themselves are kept.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/categories/${c.id}`);
      setItems((list) => list.filter((x) => x.id !== c.id));
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categories" description="The shared taxonomy used by blog posts and the portfolio module.">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-2" /> New Category
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <TableSkeleton cols={4} />
        </div>
      ) : (
        <TableCard>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH align="center">Posts</TH>
              <TH align="right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {items.length === 0 ? (
              <EmptyRow
                colSpan={4}
                icon={Tag}
                title="No categories yet"
                hint="Create categories to organize posts and portfolio items."
                action={canManage ? (
                  <Button size="sm" onClick={openCreate}><Plus size={14} className="mr-1.5" /> New Category</Button>
                ) : undefined}
              />
            ) : (
              items.map((c) => (
                <TR key={c.id}>
                  <TD>
                    <div className="flex items-center gap-2.5 font-medium">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border"
                        style={{ backgroundColor: c.color || "var(--color-muted)" }}
                      />
                      {c.name}
                    </div>
                  </TD>
                  <TD className="font-mono text-muted-foreground">/{c.slug}</TD>
                  <TD align="center" className="text-muted-foreground">{c._count?.blogs ?? 0}</TD>
                  <TD align="right">
                    {canManage && (
                      <RowActions>
                        <button onClick={() => openEdit(c)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(c)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </RowActions>
                    )}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </TableCard>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field
              label="Name"
              required
              hint={!editingId && form.name.trim() ? `Slug: /${previewSlug(form.name)}` : undefined}
            >
              <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Web Development" />
            </Field>
            <Field label="Slug" hint="Leave blank to auto-generate from the name.">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={previewSlug(form.name) || "web-development"} />
            </Field>
            <Field label="Description">
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional, shown on the category page" />
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.color || "#6366f1"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Optional hex, e.g. #6366f1" className="flex-1 font-mono text-sm" />
                {form.color && <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, color: "" })}>Clear</Button>}
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
