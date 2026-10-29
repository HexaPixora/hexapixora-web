"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Send } from "lucide-react";

const TABS = [
  { href: "/admin/newsletter", label: "Subscribers", icon: Users, exact: true },
  { href: "/admin/newsletter/campaigns", label: "Campaigns", icon: Send, exact: false },
];

export function NewsletterTabs() {
  const path = usePathname();
  return (
    <div className="flex w-fit gap-1 rounded-lg border bg-card p-1">
      {TABS.map((t) => {
        const active = t.exact ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
