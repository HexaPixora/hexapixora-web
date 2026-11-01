"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { apiClient } from "@hexapixora/sdk/browser";
import { useHasPermission } from "@/stores/use-auth-store";
import { useFeature } from "@/stores/use-features-store";
import {
  Eyebrow,
  ListRow,
  Panel,
  StatCard,
  StatusBadge,
  relativeTime,
  shortDateTime,
} from "@/components/admin/dashboard/dashboard-parts";
import { LeadsChart } from "@/components/admin/dashboard/leads-chart";
import type { DashboardSummary, StatusCounts, UpcomingItem } from "@/components/admin/dashboard/dashboard-types";

const PILL = "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors";

const LEAD_TONE: Record<string, "accent" | "warn" | "ok" | "dim"> = {
  NEW: "accent",
  CONTACTED: "warn",
  QUALIFIED: "ok",
  CLOSED: "dim",
};

function counts(c: StatusCounts | null | undefined, noun: string) {
  if (!c) return null;
  const parts = [c.draft && `${c.draft} draft${c.draft === 1 ? "" : "s"}`, c.scheduled && `${c.scheduled} scheduled`];
  return parts.filter(Boolean).join(" · ") || `No ${noun} waiting`;
}

function upcomingDetail(item: UpcomingItem) {
  const kind = item.kind === "page" ? "Page" : "Insight";
  if (item.status === "SCHEDULED" && item.publishAt) return `${kind} · goes live ${shortDateTime(item.publishAt)}`;
  return `${kind} · edited ${relativeTime(item.updatedAt)}`;
}

/** The admin's front page: what needs attention, how the site is doing, and shortcuts. */
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const themesOn = useFeature("themes");
  const newsletterOn = useFeature("newsletter");
  const canPages = useHasPermission("pages");
  const canBlogs = useHasPermission("blogs");
  const canMedia = useHasPermission("media");
  const canThemes = useHasPermission("layouts") && themesOn;
  const canNewsletter = useHasPermission("newsletter") && newsletterOn;

  useEffect(() => {
    const started = performance.now();
    apiClient
      .get<DashboardSummary>("/dashboard/summary")
      .then((res) => {
        setLatency(Math.round(performance.now() - started));
        setData(res.data);
      })
      .catch(() => setFailed(true));
  }, []);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const leads = data?.leads;
  const delta = leads ? leads.lastWeek - leads.weekBefore : 0;
  const nextPost = data?.content?.upcoming.find((item) => item.kind === "post" && item.status === "SCHEDULED");

  const quick = [
    canPages && { href: "/admin/pages", title: "New page", note: "Start from blocks" },
    canBlogs && { href: "/admin/blogs/create", title: "New insight", note: "Write a post" },
    canThemes && { href: "/admin/themes", title: "Edit theme", note: "Colours, fonts, packs" },
    canNewsletter && { href: "/admin/newsletter/campaigns", title: "Send campaign", note: "Newsletter" },
  ].filter(Boolean) as { href: string; title: string; note: string }[];

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <Eyebrow className="text-primary">Overview · {today}</Eyebrow>
          <h1 className="mt-1.5 font-heading text-[28px] font-medium leading-tight tracking-tight">Dashboard</h1>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {canMedia ? (
            <Link href="/admin/media" className={`${PILL} hover:border-muted-foreground`}>
              Upload media
            </Link>
          ) : null}
          {canBlogs ? (
            <Link href="/admin/blogs/create" className={`${PILL} hover:border-muted-foreground`}>
              New insight
            </Link>
          ) : null}
          {canPages ? (
            <Link href="/admin/pages" className={`${PILL} border-primary bg-primary text-primary-foreground`}>
              <Plus size={15} aria-hidden="true" /> New page
            </Link>
          ) : null}
        </div>
      </div>

      {failed ? (
        <p className="border bg-card p-5 text-sm text-destructive">
          The dashboard couldn&apos;t load. The API may be restarting; refresh in a moment.
        </p>
      ) : !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[118px] animate-pulse border bg-card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {leads ? (
              <StatCard
                label="New leads · 7 days"
                value={leads.lastWeek}
                note={
                  <>
                    <span className={delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : ""}>
                      {delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${-delta}` : "No change"}
                    </span>{" "}
                    vs the 7 days before
                  </>
                }
              />
            ) : null}
            {data.newsletter ? (
              <StatCard
                label="Subscribers"
                value={data.newsletter.active}
                note={
                  data.newsletter.newThisMonth > 0 ? (
                    <>
                      <span className="text-success">▲ {data.newsletter.newThisMonth}</span> this month
                    </>
                  ) : (
                    "None new this month"
                  )
                }
              />
            ) : null}
            {data.content?.pages ? (
              <StatCard label="Pages live" value={data.content.pages.published} note={counts(data.content.pages, "pages")} />
            ) : null}
            {data.content?.posts ? (
              <StatCard
                label="Insights published"
                value={data.content.posts.published}
                note={[
                  counts(data.content.posts, "posts"),
                  nextPost?.publishAt ? `next ${shortDateTime(nextPost.publishAt)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {leads ? (
              <Panel
                title="Leads per week"
                aside={<Eyebrow>last 12 weeks</Eyebrow>}
                link={{ href: "/admin/leads", label: "Open leads" }}
              >
                <LeadsChart weekly={leads.weekly} generatedAt={data.generatedAt} />
              </Panel>
            ) : null}
            {quick.length > 0 ? (
              <Panel title="Quick actions">
                <div className="grid grid-cols-2 gap-2.5">
                  {quick.map((action) => (
                    <a
                      key={action.href + action.title}
                      href={action.href}
                      className="flex flex-col gap-1 border bg-secondary p-3.5 transition-colors hover:border-primary"
                    >
                      <span className="font-heading text-sm font-medium">{action.title}</span>
                      <span className="text-xs text-muted-foreground">{action.note}</span>
                    </a>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {data.content ? (
              <Panel title="Content status" link={{ href: canPages ? "/admin/pages" : "/admin/blogs", label: "All content" }}>
                {data.content.upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Everything is published. Nothing scheduled or in draft.</p>
                ) : (
                  data.content.upcoming.map((item) => (
                    <ListRow
                      key={item.kind + item.id}
                      href={item.kind === "page" ? `/admin/pages/${item.id}` : `/admin/blogs/${item.id}/edit`}
                      title={item.title}
                      detail={upcomingDetail(item)}
                      end={
                        <StatusBadge tone={item.status === "SCHEDULED" ? "warn" : "dim"}>
                          {item.status === "SCHEDULED" ? "Scheduled" : "Draft"}
                        </StatusBadge>
                      }
                    />
                  ))
                )}
              </Panel>
            ) : null}

            {leads ? (
              <Panel
                title="Latest leads"
                aside={leads.waiting > 0 ? <StatusBadge tone="accent">{leads.waiting} new</StatusBadge> : undefined}
                link={{ href: "/admin/leads", label: "Inbox" }}
              >
                {leads.latest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leads yet.</p>
                ) : (
                  leads.latest.map((lead) => (
                    <ListRow
                      key={lead.id}
                      href="/admin/leads"
                      title={lead.name}
                      detail={`${lead.type.charAt(0).toUpperCase()}${lead.type.slice(1)} · ${relativeTime(lead.createdAt)}`}
                      end={<StatusBadge tone={LEAD_TONE[lead.status] ?? "dim"}>{lead.status.toLowerCase()}</StatusBadge>}
                    />
                  ))
                )}
              </Panel>
            ) : null}

            <Panel title="Site health" aside={<span className="ml-auto" />}>
              <HealthRow ok label="API" value={latency !== null ? `Up · ${latency} ms` : "Up"} />
              <HealthRow ok label="Database" value="Connected" />
              <HealthRow label="Theme" value={data.health.theme} />
              <HealthRow
                ok={data.health.siteRefresh.last?.ok}
                label="Last site refresh"
                value={
                  !data.health.siteRefresh.enabled
                    ? "Not set up"
                    : data.health.siteRefresh.last
                      ? `${data.health.siteRefresh.last.ok ? "" : "Failed · "}${relativeTime(data.health.siteRefresh.last.at)}`
                      : "None since the API started"
                }
              />
              {data.newsletter ? (
                <HealthRow
                  label="Last campaign"
                  value={
                    data.newsletter.lastCampaign?.sentAt
                      ? `${data.newsletter.lastCampaign.sentCount} sent · ${relativeTime(data.newsletter.lastCampaign.sentAt)}`
                      : "None sent yet"
                  }
                />
              ) : null}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function HealthRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 border-t py-2.5 text-sm first-of-type:border-t-0">
      <span
        aria-hidden="true"
        className={ok === undefined ? "text-muted-foreground" : ok ? "text-success" : "text-destructive"}
      >
        ●
      </span>
      <span className="font-semibold">{label}</span>
      <span className="ml-auto text-right text-muted-foreground">{value}</span>
    </div>
  );
}
