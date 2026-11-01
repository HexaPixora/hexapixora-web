import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/admin/auth/forgot-password-form";
import { getSiteBrand } from "@/lib/site-brand";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage() {
  const brand = await getSiteBrand();
  return (
    <AuthShell brand={brand} title="Reset your password" description="Enter your email and we'll send you a reset link.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
