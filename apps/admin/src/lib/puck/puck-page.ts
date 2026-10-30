import type { Data } from "@puckeditor/core";
import type { ContentStatus } from "@/components/admin/status-control";
import { puckToSections, type StoredSection } from "./puck-sections";

export type Publishing = { status: ContentStatus; publishAt: string | null };

/** The page's own settings, edited in Puck's page panel (`data.root.props`). */
export type PageRoot = {
  title: string;
  slug: string;
  showHeader: boolean;
  showFooter: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  publishing: Publishing;
};

/** What `PUT /pages/:id` takes. */
export type PagePayload = Omit<PageRoot, "publishing"> & {
  status: ContentStatus;
  publishAt: string | null;
  sections: StoredSection[];
};

const STATUSES: ContentStatus[] = ["DRAFT", "SCHEDULED", "PUBLISHED"];

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** Lowercase letters, digits and dashes, as the page address needs. */
export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

/** A page from `GET /pages/admin/:id` → the page panel's values. */
export function pageToRoot(page: Record<string, unknown>): PageRoot {
  const status = STATUSES.includes(page.status as ContentStatus)
    ? (page.status as ContentStatus)
    : "PUBLISHED";
  return {
    title: text(page.title),
    slug: text(page.slug),
    showHeader: page.showHeader !== false,
    showFooter: page.showFooter !== false,
    metaTitle: text(page.metaTitle),
    metaDescription: text(page.metaDescription),
    ogImage: text(page.ogImage),
    publishing: {
      status,
      publishAt: text(page.publishAt) || null,
    },
  };
}

/** Puck data → the save payload. Also the editor's dirty check, so it is stable. */
export function toPayload(data: {
  content: Data["content"];
  root: { props?: Record<string, unknown> };
}): PagePayload {
  const props = data.root.props ?? {};
  // pageToRoot reads status and publishAt at the top level, as the API sends them.
  const root = pageToRoot({
    ...props,
    ...((props.publishing ?? {}) as Record<string, unknown>),
  });
  return {
    title: root.title,
    slug: slugify(root.slug),
    showHeader: root.showHeader,
    showFooter: root.showFooter,
    metaTitle: root.metaTitle,
    metaDescription: root.metaDescription,
    ogImage: root.ogImage,
    status: root.publishing.status,
    publishAt:
      root.publishing.status === "SCHEDULED" ? root.publishing.publishAt : null,
    sections: puckToSections(data.content),
  };
}
