"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Toaster } from "sonner";
import { apiClient } from "@hexapixora/sdk/browser";
import { ConfirmProvider } from "@/components/admin/confirm-dialog";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { CommandMenu } from "@/components/admin/shell/command-menu";
import { itemFor, type NavItem } from "@/components/admin/shell/nav";
import { useAuthStore, useIsAdmin } from "@/stores/use-auth-store";
import { isFeatureOn, useFeaturesStore } from "@/stores/use-features-store";

type Branding = { siteName?: string; logoUrl?: string | null };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser, user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [featuresReady, setFeaturesReady] = useState(false);
  const { features, setFeatures } = useFeaturesStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [newLeads, setNewLeads] = useState(0);
  const pathname = usePathname();

  // Items carry a permission (section key); admins see everything, team
  // members only the sections they were granted. Switched-off features
  // (FEATURES in the API) are hidden for everyone.
  const canSee = useCallback(
    (item: NavItem) =>
      (!item.feature || isFeatureOn(features, item.feature)) &&
      (!item.permission ||
        isAdmin ||
        (Array.isArray(user?.permissions) && user.permissions.includes(item.permission))),
    [isAdmin, user, features],
  );

  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/login";
      });
    // Which optional features the API runs. If it can't say, everything shows
    // (the API's own default) and a switched-off area just reports its 404.
    apiClient
      .get("/features")
      .then((res) => setFeatures(res.data?.data ?? {}))
      .catch(() => {})
      .finally(() => setFeaturesReady(true));
    // Branding (logo and site name) for the sidebar.
    apiClient
      .get("/settings")
      .then((res) => setBranding(res.data))
      .catch(() => {});
  }, [setUser, setFeatures]);

  // New leads waiting, for the sidebar badge.
  const canLeads =
    !loading && featuresReady && canSee({ href: "", label: "", icon: X, permission: "leads", feature: "leads" });
  useEffect(() => {
    if (!canLeads) return;
    apiClient
      .get("/leads", { params: { status: "NEW", limit: 1 } })
      .then((res) => setNewLeads(typeof res.data?.total === "number" ? res.data.total : 0))
      .catch(() => {});
  }, [canLeads]);

  // Ctrl+K / ⌘K opens the search anywhere in the admin.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Signed out locally either way.
    }
    setUser(null);
    window.location.href = "/login";
  };

  if (loading || !featuresReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    );
  }

  // A direct link to a switched-off area shows a note instead of a broken screen.
  const current = itemFor(pathname);
  const switchedOff = current?.feature && !isFeatureOn(features, current.feature) ? current.label : null;

  const sidebar = (
    <AdminSidebar
      pathname={pathname}
      canSee={canSee}
      siteName={branding?.siteName || "HexaPixora"}
      logoUrl={branding?.logoUrl}
      newLeads={newLeads}
      user={user}
      onLogout={logout}
    />
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="sticky top-0 hidden h-screen md:flex">{sidebar}</div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 left-0 top-0 z-10 w-64">
            {sidebar}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-5 text-muted-foreground"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          pathname={pathname}
          onMenu={() => setSidebarOpen(true)}
          onSearch={() => setSearchOpen(true)}
          notifications={!loading}
        />
        <main className="flex-1 p-4 md:p-7 lg:p-8">
          <ConfirmProvider>{switchedOff ? <SwitchedOff label={switchedOff} /> : children}</ConfirmProvider>
        </main>
      </div>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} canSee={canSee} />
    </div>
  );
}

function SwitchedOff({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-heading text-xl font-medium">{label} is switched off</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This site doesn&apos;t run this feature. It can be switched on in the API&apos;s FEATURES setting.
      </p>
      <a href="/admin" className="mt-6 inline-block text-sm text-primary hover:underline">
        Back to the dashboard
      </a>
    </div>
  );
}
