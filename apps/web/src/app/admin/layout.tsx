"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  LayoutDashboard, Wrench, Image as ImageIcon, BookOpen, Briefcase, Settings,
  Users, Star, HelpCircle, Mail, MessageSquare, Menu, Layers, LogOut,
  ChevronRight, X, FileText
} from "lucide-react";

const navGroups = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/blogs", label: "Blog", icon: BookOpen },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    label: "Builders",
    items: [
      { href: "/admin/modules", label: "Modules Library", icon: Wrench },
      { href: "/admin/layouts/menu", label: "Mega Menu", icon: Menu },
      { href: "/admin/layouts/footer", label: "Footer Menu", icon: Menu },
      { href: "/admin/pages/home", label: "Homepage", icon: Layers },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/leads", label: "Leads / CRM", icon: MessageSquare },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Verify session on mount
    apiClient.get("/auth/me")
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => { window.location.href = "/login"; });
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
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-5 border-b">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">H</div>
          <span className="font-bold text-base">HexaPixora</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">CMS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-1.5 tracking-wider">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
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
                    {active && <ChevronRight size={13} className="ml-auto text-primary" />}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
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
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View Site →
          </a>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
