import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/auth-shell";
import { ResetPasswordForm } from "@/components/admin/auth/reset-password-form";
import { getSiteBrand } from "@/lib/site-brand";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const [brand, { token }] = await Promise.all([getSiteBrand(), searchParams]);
  return (
    <AuthShell brand={brand} title="Choose a new password" description="Pick a password you don't use anywhere else.">
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </AuthShell>
  );
}
