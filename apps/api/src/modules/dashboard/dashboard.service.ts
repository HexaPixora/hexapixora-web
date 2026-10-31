import { Injectable } from '@nestjs/common';
import { ContentStatus, LeadStatus } from '@hexapixora/database';
import { PrismaService } from '../../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { weeklyCounts } from './weekly-counts';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 12;

/** What the signed-in user may see; each dashboard section needs its permission. */
export type DashboardAccess = {
  leads: boolean;
  newsletter: boolean;
  pages: boolean;
  blogs: boolean;
};

type StatusCounts = { published: number; draft: number; scheduled: number };

/**
 * The admin dashboard in one read (plans/admin-redesign): leads, newsletter,
 * content status and site health. Sections the user can't open are null.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  async summary(access: DashboardAccess, now = new Date()) {
    const [leads, newsletter, pages, posts, upcoming, theme] =
      await Promise.all([
        access.leads ? this.leads(now) : null,
        access.newsletter ? this.newsletter(now) : null,
        access.pages ? this.statusCounts('page') : null,
        access.blogs ? this.statusCounts('post') : null,
        this.upcoming(access),
        this.prisma.themePack.findFirst({
          where: { isActive: true },
          select: { name: true },
        }),
      ]);

    return {
      generatedAt: now.toISOString(),
      leads,
      newsletter,
      content: access.pages || access.blogs ? { pages, posts, upcoming } : null,
      health: {
        // This answer itself needed the database.
        database: 'up' as const,
        theme: theme?.name ?? 'Hexa Noir',
        siteRefresh: {
          enabled: this.revalidate.enabled,
          last: this.revalidate.lastRefresh
            ? {
                at: this.revalidate.lastRefresh.at.toISOString(),
                ok: this.revalidate.lastRefresh.ok,
              }
            : null,
        },
      },
    };
  }

  private async leads(now: Date) {
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);
    const windowStart = new Date(now.getTime() - WEEKS * 7 * DAY_MS);
    const [lastWeek, weekBefore, waiting, recent, latest] = await Promise.all([
      this.prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.lead.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      this.prisma.lead.count({ where: { status: LeadStatus.NEW } }),
      this.prisma.lead.findMany({
        where: { createdAt: { gte: windowStart } },
        select: { createdAt: true },
      }),
      this.prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);
    return {
      lastWeek,
      weekBefore,
      waiting,
      weekly: weeklyCounts(
        recent.map((lead) => lead.createdAt),
        now,
        WEEKS,
      ),
      latest,
    };
  }

  private async newsletter(now: Date) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [active, newThisMonth, lastCampaign] = await Promise.all([
      this.prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      this.prisma.newsletterSubscriber.count({
        where: { status: 'ACTIVE', createdAt: { gte: monthStart } },
      }),
      this.prisma.campaign.findFirst({
        where: { sentAt: { not: null } },
        orderBy: { sentAt: 'desc' },
        select: {
          subject: true,
          status: true,
          sentAt: true,
          sentCount: true,
          recipientCount: true,
        },
      }),
    ]);
    return { active, newThisMonth, lastCampaign };
  }

  private async statusCounts(kind: 'page' | 'post'): Promise<StatusCounts> {
    const rows =
      kind === 'page'
        ? await this.prisma.page.groupBy({
            by: ['status'],
            _count: { _all: true },
          })
        : await this.prisma.blog.groupBy({
            by: ['status'],
            _count: { _all: true },
          });
    const count = (status: ContentStatus) =>
      rows.find((row) => row.status === status)?._count._all ?? 0;
    return {
      published: count(ContentStatus.PUBLISHED),
      draft: count(ContentStatus.DRAFT),
      scheduled: count(ContentStatus.SCHEDULED),
    };
  }

  /** Scheduled items (soonest first), then drafts (latest edit first), at most six. */
  private async upcoming(access: DashboardAccess) {
    const notLive = {
      status: { in: [ContentStatus.SCHEDULED, ContentStatus.DRAFT] },
    };
    const select = {
      id: true,
      title: true,
      status: true,
      publishAt: true,
      updatedAt: true,
    };
    const [pages, posts] = await Promise.all([
      access.pages
        ? this.prisma.page.findMany({
            where: notLive,
            select,
            take: 6,
            orderBy: { updatedAt: 'desc' },
          })
        : [],
      access.blogs
        ? this.prisma.blog.findMany({
            where: notLive,
            select,
            take: 6,
            orderBy: { updatedAt: 'desc' },
          })
        : [],
    ]);
    const items = [
      ...pages.map((page) => ({ ...page, kind: 'page' as const })),
      ...posts.map((post) => ({ ...post, kind: 'post' as const })),
    ];
    const scheduled = items
      .filter((item) => item.status === ContentStatus.SCHEDULED)
      .sort(
        (a, b) =>
          (a.publishAt?.getTime() ?? Infinity) -
          (b.publishAt?.getTime() ?? Infinity),
      );
    const drafts = items
      .filter((item) => item.status === ContentStatus.DRAFT)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return [...scheduled, ...drafts].slice(0, 6);
  }
}
