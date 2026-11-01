import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/auth-shell";
import { VerifyEmailStatus } from "@/components/admin/auth/verify-email-status";
import { getSiteBrand } from "@/lib/site-brand";

export const metadata: Metadata = { title: "Email verification" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const [brand, { token }] = await Promise.all([getSiteBrand(), searchParams]);
  return (
    <AuthShell brand={brand} title="Email verification" description="Confirming your new email address.">
      <VerifyEmailStatus token={typeof token === "string" ? token : ""} />
    </AuthShell>
  );
}
