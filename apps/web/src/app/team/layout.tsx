"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="flex flex-col flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <span className="font-semibold text-lg text-primary">Team Portal</span>
          <div className="flex-1"></div>
          <div>
            <span className="text-sm font-medium">{user?.email || 'Team Member'}</span>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-6 container mx-auto">{children}</main>
      </div>
    </div>
  );
}
