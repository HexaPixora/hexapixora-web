import {
  Blocks,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  Menu,
  Palette,
  PanelBottom,
  PanelTop,
  Settings,
  Tag,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only for admins or team members granted this section. */
  permission?: string;
  /** Active only on this exact path (the dashboard), not its children. */
  exact?: boolean;
  /** Shows the count of new leads. */
  badge?: "newLeads";
};

export type NavGroup = { label?: string; items: NavItem[] };

// The sidebar, grouped by job (plans/admin-redesign). The command menu lists
// the same destinations.
export const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText, permission: "pages" },
      { href: "/admin/blogs", label: "Insights", icon: BookOpen, permission: "blogs" },
      { href: "/admin/media", label: "Media library", icon: ImageIcon, permission: "media" },
      { href: "/admin/categories", label: "Categories", icon: Tag, permission: "categories" },
    ],
  },
  {
    label: "Site design",
    items: [
      { href: "/admin/themes", label: "Themes", icon: Palette, permission: "layouts" },
      { href: "/admin/layouts/header", label: "Header", icon: PanelTop, permission: "layouts" },
      { href: "/admin/layouts/footer", label: "Footer", icon: PanelBottom, permission: "layouts" },
      { href: "/admin/layouts/menu", label: "Menus", icon: Menu, permission: "layouts" },
      { href: "/admin/modules", label: "Block defaults", icon: Blocks, permission: "layouts" },
    ],
  },
  {
    label: "Audience",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox, permission: "leads", badge: "newLeads" },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail, permission: "newsletter" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
      { href: "/admin/profile", label: "Your profile", icon: UserRound },
    ],
  },
];

/** Whether `pathname` is in `item`'s section. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** The nav item a path belongs to (for the breadcrumb), or undefined. */
export function itemFor(pathname: string): NavItem | undefined {
  return NAV_GROUPS.flatMap((group) => group.items).find((item) => isActive(item, pathname));
}
