// GET /dashboard/summary (apps/api/src/modules/dashboard). Sections the user
// may not open are null.

export type LeadRow = { id: string; name: string; type: string; status: string; createdAt: string };

export type StatusCounts = { published: number; draft: number; scheduled: number };

export type UpcomingItem = {
  id: string;
  title: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishAt: string | null;
  updatedAt: string;
  kind: "page" | "post";
};

export type DashboardSummary = {
  generatedAt: string;
  leads: { lastWeek: number; weekBefore: number; waiting: number; weekly: number[]; latest: LeadRow[] } | null;
  newsletter: {
    active: number;
    newThisMonth: number;
    lastCampaign: { subject: string; status: string; sentAt: string | null; sentCount: number; recipientCount: number } | null;
  } | null;
  content: { pages: StatusCounts | null; posts: StatusCounts | null; upcoming: UpcomingItem[] } | null;
  health: {
    database: "up";
    theme: string;
    siteRefresh: { enabled: boolean; last: { at: string; ok: boolean } | null };
  };
};
