"use client";

import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, PageHeader } from "@/components/admin/ui";
import { User as UserIcon, Lock, Mail } from "lucide-react";

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const saveName = async () => {
    if (!name.trim()) return toast.error("Name can't be empty");
    setSavingName(true);
    try {
      const res = await apiClient.patch("/account/profile", { name: name.trim() });
      if (user) setUser({ ...user, name: res.data?.name ?? name.trim() });
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword) return toast.error("Enter your current password");
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("New passwords don't match");
    setSavingPw(true);
    try {
      await apiClient.post("/account/change-password", { currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't change password");
    } finally {
      setSavingPw(false);
    }
  };

  const changeEmail = async () => {
    if (!newEmail.trim()) return toast.error("Enter a new email address");
    setSavingEmail(true);
    try {
      const res = await apiClient.post("/account/change-email", { newEmail: newEmail.trim() });
      toast.success(res.data?.message || "Check your new inbox to confirm the change.");
      setNewEmail("");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Couldn't start email change");
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Your Profile" description="Manage your name, password and email address." />

      <SectionCard title="Profile" description="Your display name across the admin." icon={UserIcon}>
        <div className="space-y-4">
          <Field label="Email">
            <Input value={user?.email || ""} disabled />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </Field>
          <div className="flex justify-end">
            <Button onClick={saveName} disabled={savingName}>
              {savingName ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Password" description="Use a strong password you don't reuse elsewhere." icon={Lock}>
        <div className="space-y-4">
          <Field label="Current password">
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <div className="flex justify-end">
            <Button onClick={changePassword} disabled={savingPw}>
              {savingPw ? "Updating..." : "Update password"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Email" description="We'll email a confirmation link to the new address — the change only applies after you click it." icon={Mail}>
        <div className="space-y-4">
          <Field label="New email address">
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@email.com" />
          </Field>
          <div className="flex justify-end">
            <Button onClick={changeEmail} disabled={savingEmail}>
              {savingEmail ? "Sending..." : "Send confirmation"}
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
