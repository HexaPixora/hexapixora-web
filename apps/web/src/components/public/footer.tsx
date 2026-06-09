import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

async function getFooterData() {
  try {
    const res = await fetch('http://localhost:3001/api/layouts/footer', { cache: 'no-store' });
    const json = await res.json();
    return json?.data || { quickLinks: [], legalLinks: [] };
  } catch (err) {
    return { quickLinks: [], legalLinks: [] };
  }
}

export default async function PublicFooter({ settings }: { settings: any }) {
  const currentYear = new Date().getFullYear();
  const footerData = await getFooterData();
  
  const quickLinks = footerData.quickLinks?.length > 0 ? footerData.quickLinks : [
    { id: "1", label: "Home", url: "/" },
    { id: "2", label: "About Us", url: "/about" },
    { id: "3", label: "Services", url: "/services" },
    { id: "4", label: "Portfolio", url: "/portfolio" },
    { id: "5", label: "Blog", url: "/blog" },
  ];

  const legalLinks = footerData.legalLinks?.length > 0 ? footerData.legalLinks : [
    { id: "1", label: "Privacy Policy", url: "/privacy" },
    { id: "2", label: "Terms of Service", url: "/terms" },
    { id: "3", label: "Cookie Policy", url: "/cookies" },
  ];
  
  return (
    <footer className="border-t bg-muted/20 pt-16 pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName || "Logo"} className="h-8 w-auto grayscale opacity-80 hover:grayscale-0 transition-all" />
            ) : (
              <span className="font-bold text-xl tracking-tight">{settings?.siteName || "HexaPixora"}</span>
            )}
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {settings?.tagline || "We build scalable digital solutions for modern businesses."}
          </p>
          <div className="flex items-center gap-4 pt-2">
            {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">Facebook</a>}
            {settings?.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">Twitter</a>}
            {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">Instagram</a>}
            {settings?.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>}
            {settings?.socialLinks?.youtube && <a href={settings.socialLinks.youtube} target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">YouTube</a>}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {quickLinks.map((link: any) => (
              <li key={link.id}><Link href={link.url} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {legalLinks.map((link: any) => (
              <li key={link.id}><Link href={link.url} className="hover:text-primary">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {settings?.businessEmail && (
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5" />
                <a href={`mailto:${settings.businessEmail}`} className="hover:text-primary">{settings.businessEmail}</a>
              </li>
            )}
            {settings?.businessPhone && (
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5" />
                <a href={`tel:${settings.businessPhone}`} className="hover:text-primary">{settings.businessPhone}</a>
              </li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="container flex flex-col items-center justify-between gap-4 md:h-10 md:flex-row border-t pt-8">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {currentYear} {settings?.siteName || "HexaPixora"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
