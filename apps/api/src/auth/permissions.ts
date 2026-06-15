/**
 * Canonical list of grantable admin sections. A TEAM_MEMBER may be granted any
 * subset of these by an admin; ADMIN/SUPER_ADMIN implicitly have all of them.
 *
 * Keep this in sync with the web app's lib/permissions.ts.
 */
export const SECTIONS = [
  'pages',
  'blogs',
  'media',
  'layouts',
  'leads',
  'newsletter',
  'settings',
  'chat',
] as const;

export type Section = (typeof SECTIONS)[number];
