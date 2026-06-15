"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { useAuthStore, useIsAdmin } from "@/stores/use-auth-store";
import { SECTIONS } from "@/lib/permissions";

type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "TEAM_MEMBER";
  permissions: string[];
  createdAt: string;
};

type FormState = {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "TEAM_MEMBER";
  permissions: string[];
};

const EMPTY_FORM: FormState = {
  email: "",
  name: "",
  password: "",
  role: "TEAM_MEMBER",
  permissions: [],
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEAM_MEMBER: "Team Member",
};

export default function UsersAdminPage() {
  const isAdmin = useIsAdmin();
  const confirm = useConfirm();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
    else setLoading(false);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        You don&apos;t have permission to manage team members.
      </div>
    );
  }

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      name: u.name || "",
      password: "",
      role: u.role === "ADMIN" ? "ADMIN" : "TEAM_MEMBER",
      permissions: u.permissions || [],
    });
    setDialogOpen(true);
  };

  const togglePermission = (key: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  };

  const save = async () => {
    if (!editingId && (!form.email || !form.password)) {
      toast.error("Email and password are required");
      return;
    }
    if (!editingId && form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      // Admins implicitly have all access, so we only persist permissions for
      // team members.
      const permissions = form.role === "TEAM_MEMBER" ? form.permissions : [];
      if (editingId) {
        const payload: any = { name: form.name, role: form.role, permissions };
        if (form.password) payload.password = form.password;
        await apiClient.patch(`/users/${editingId}`, payload);
        toast.success("Member updated");
      } else {
        await apiClient.post("/users", {
          email: form.email,
          name: form.name || undefined,
          password: form.password,
          role: form.role,
          permissions,
        });
        toast.success("Member created");
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: AdminUser) => {
    const ok = await confirm({
      title: "Delete team member?",
      description: `${u.email} will lose access immediately. This cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await apiClient.delete(`/users/${u.id}`);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      toast.success("Member deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Create members and control which sections they can access.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" /> Add Member
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading members...</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Access</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                        {(u.name?.[0] || u.email[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded">
                      {u.role !== "TEAM_MEMBER" && <ShieldCheck size={12} className="text-primary" />}
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== "TEAM_MEMBER" ? (
                      <span className="text-xs text-muted-foreground">Full access</span>
                    ) : u.permissions.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No sections</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.map((p) => (
                          <span key={p} className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.role !== "SUPER_ADMIN" && (
                        <button onClick={() => openEdit(u)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10" title="Edit">
                          <Pencil size={15} />
                        </button>
                      )}
                      {u.id !== currentUserId && u.role !== "SUPER_ADMIN" && (
                        <button onClick={() => remove(u)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No team members yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                disabled={!!editingId}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="member@hexapixora.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {editingId ? "New Password" : "Password"}
                {editingId && <span className="text-muted-foreground font-normal"> (leave blank to keep current)</span>}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as FormState["role"] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="TEAM_MEMBER">Team Member (limited access)</option>
                <option value="ADMIN">Admin (full access)</option>
              </select>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <UserIcon size={14} className="text-muted-foreground" />
                <label className="text-sm font-semibold">Section Access</label>
              </div>
              {form.role !== "TEAM_MEMBER" ? (
                <p className="text-xs text-muted-foreground">Admins have access to every section.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTIONS.map((section) => {
                    const checked = form.permissions.includes(section.key);
                    return (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => togglePermission(section.key)}
                        className={`flex items-start gap-2 text-left p-3 rounded-lg border transition-colors ${
                          checked ? "border-primary bg-primary/5" : "border-input hover:bg-muted/40"
                        }`}
                      >
                        <span className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                          {checked && <span className="h-2 w-2 rounded-sm bg-primary-foreground" />}
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{section.label}</span>
                          <span className="block text-xs text-muted-foreground">{section.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
