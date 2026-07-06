"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  LayoutDashboard, Wrench, Image as ImageIcon, BookOpen, Briefcase, Settings,
  Users, Star, HelpCircle, Mail, MessageSquare, MessageCircle, Bot, Menu, Layers, LogOut,
  ChevronRight, X, FileText, Tag
} from "lucide-react";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/admin/confirm-dialog";
import { siteUrl } from "@/lib/site-url";
import { useIsAdmin } from "@/stores/use-auth-store";
import { useChatUnread } from "@/lib/use-chat-unread";
import { NotificationBell } from "@/components/admin/notification-bell";

// Each item may declare a `permission` (section key) — shown only to admins or
// team members granted that section — or `adminOnly` for admin-exclusive pages.
// Items with neither (Dashboard) are always visible.
const navGroups = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/pages", label: "Pages", icon: FileText, permission: "pages" },
      { href: "/admin/blogs", label: "Insights", icon: BookOpen, permission: "blogs" },
      { href: "/admin/categories", label: "Categories", icon: Tag, permission: "categories" },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon, permission: "media" },
    ],
  },
  {
    label: "Builders",
    items: [
      { href: "/admin/modules", label: "Modules Library", icon: Wrench, permission: "layouts" },
      { href: "/admin/layouts/menu", label: "Navigations", icon: Menu, permission: "layouts" },
      { href: "/admin/layouts/header", label: "Global Header", icon: Layers, permission: "layouts" },
      { href: "/admin/layouts/footer", label: "Global Footer", icon: Layers, permission: "layouts" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/leads", label: "Leads / CRM", icon: MessageSquare, permission: "leads" },
      { href: "/admin/chat", label: "Conversations", icon: MessageCircle, permission: "chat", exact: true, badge: "chatUnread" },
      { href: "/admin/chat/settings", label: "Chatbot AI", icon: Bot, adminOnly: true },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail, permission: "newsletter" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
      { href: "/admin/users", label: "Team Members", icon: Users, adminOnly: true },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser, user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const pathname = usePathname();

  // Visibility of a nav item for the current user.
  const canSeeNavItem = (item: any) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) {
      return isAdmin || (Array.isArray(user?.permissions) && user.permissions.includes(item.permission));
    }
    return true;
  };

  // Live "needs attention" badge for the Conversations nav item.
  const canSeeChat = isAdmin || (Array.isArray(user?.permissions) && user.permissions.includes("chat"));
  const chatUnread = useChatUnread(!!canSeeChat && !loading);

  useEffect(() => {
    // Verify session on mount
    apiClient.get("/auth/me")
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => { window.location.href = "/login"; });
    // Load branding (logo + site name) for the sidebar.
    apiClient.get("/settings").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch { }
    setUser(null);
    window.location.href = "/login";
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-background border-r w-64 flex-shrink-0">
      {/* Logo + Site Name (from branding settings) */}
      <div className="flex items-center justify-between h-14 px-5 border-b">
        <div className="flex items-center gap-2 min-w-0">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings?.siteName || "HexaPixora"}
              className="h-7 w-auto object-contain flex-shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
              {settings?.siteName?.[0]?.toUpperCase() || "H"}
            </div>
          )}
          <span className="font-bold text-base truncate">{settings?.siteName || "HexaPixora"}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">CMS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map(group => {
          const items = group.items.filter(canSeeNavItem);
          if (items.length === 0) return null;
          return (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-1.5 tracking-wider">{group.label}</p>
            <div className="space-y-0.5">
              {items.map(item => {
                const active = isActive(item.href, (item as any).exact);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon size={16} className={active ? "text-primary" : ""} />
                    {item.label}
                    {(item as any).badge === "chatUnread" && chatUnread > 0 && (
                      <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {chatUnread > 99 ? "99+" : chatUnread}
                      </span>
                    )}
                    {active && !((item as any).badge === "chatUnread" && chatUnread > 0) && (
                      <ChevronRight size={13} className="ml-auto text-primary" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
          <a href="/admin/profile" className="flex min-w-0 flex-1 items-center gap-3" title="Manage your profile">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </a>
          <button onClick={logout} className="text-muted-foreground transition-colors hover:text-destructive" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Toaster position="top-center" richColors />
      {/* Desktop Sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <Sidebar />
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b bg-background flex items-center px-6 gap-4 sticky top-0 z-40">
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <nav className="text-sm text-muted-foreground flex items-center gap-1">
              <span>Admin</span>
              {pathname !== "/admin" && (
                <>
                  <ChevronRight size={13} />
                  <span className="text-foreground capitalize">
                    {pathname.split("/").filter(Boolean).slice(1).join(" › ")}
                  </span>
                </>
              )}
            </nav>
          </div>
          <NotificationBell enabled={!loading} />
          <a
            href={siteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View Site →
          </a>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <ConfirmProvider>{children}</ConfirmProvider>
        </main>
      </div>
    </div>
  );
}
