import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth/auth-shell";
import { LoginForm } from "@/components/admin/auth/login-form";
import { getSiteBrand } from "@/lib/site-brand";

export const metadata: Metadata = { title: "Sign in" };

/** Only admin paths may be returned to, so the link can't send anyone off-site. */
function safeReturnTo(from: unknown): string {
  return typeof from === "string" && /^\/admin(?:[/?#]|$)/.test(from) ? from : "/admin";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  const [brand, { from }] = await Promise.all([getSiteBrand(), searchParams]);
  return (
    <AuthShell brand={brand} title="Sign in" description={`Welcome back. Sign in to manage ${brand.siteName}.`}>
      <LoginForm returnTo={safeReturnTo(from)} />
    </AuthShell>
  );
}
