import React from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  children: MenuItem[];
}

interface HeaderProps {
  menuItems: MenuItem[];
  settings: any;
}

export default function PublicHeader({ menuItems, settings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-xl tracking-tight">{settings?.siteName || "HexaPixora"}</span>
          )}
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="relative group">
              {item.children && item.children.length > 0 ? (
                <div className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors cursor-pointer py-2">
                  {item.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 hidden group-hover:block pt-2">
                    <div className="bg-background border rounded-md shadow-lg p-2 min-w-[200px] flex flex-col gap-1">
                      {item.children.map(child => (
                        <Link 
                          key={child.id} 
                          href={child.url} 
                          target={child.target}
                          className="px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href={item.url} 
                  target={item.target}
                  className="text-sm font-medium hover:text-primary transition-colors py-2 block"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <Button asChild className="hidden md:inline-flex">
            <Link href="/contact">Get in Touch</Link>
          </Button>
          
          {/* Mobile menu toggle would go here */}
          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
