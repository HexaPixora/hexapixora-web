/**
 * Grantable admin sections, shown as permission toggles when an admin edits a
 * team member. Keep in sync with the API's auth/permissions.ts SECTIONS.
 */
export const SECTIONS = [
  { key: "pages", label: "Pages", description: "Create and edit custom pages" },
  { key: "blogs", label: "Blog", description: "Write and manage blog posts" },
  { key: "media", label: "Media Library", description: "Upload and manage media" },
  { key: "layouts", label: "Builders & Layouts", description: "Homepage, header, footer, navigation, modules" },
  { key: "leads", label: "Leads / CRM", description: "View and manage contact submissions" },
  { key: "chat", label: "Conversations / Chatbot", description: "Reply to live chats and manage the support AI" },
  { key: "newsletter", label: "Newsletter", description: "View and manage subscribers" },
  { key: "settings", label: "Settings", description: "Global site configuration" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];
