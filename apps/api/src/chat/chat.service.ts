import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { ChatRole, ConversationStatus, NotificationType, Role } from '@repo/database';

export interface ChatUser {
  id: string;
  role: string;
}
import { PrismaService } from '../prisma/prisma.service';
import { ChatAiService, AiMessage } from './chat-ai.service';
import { ChatGateway } from './chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ConversationActionDto,
  StartConversationDto,
  UpdateChatbotConfigDto,
} from './dto/chat.dto';

const CONFIG_ID = 'global';

interface QuickReplyNode {
  label: string;
  reply?: string;
  children: QuickReplyNode[];
}
export interface PublicQuickReply {
  label: string;
  children?: PublicQuickReply[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private ai: ChatAiService,
    private gateway: ChatGateway,
    private notifications: NotificationsService,
  ) {}

  // ---- config ---------------------------------------------------------------

  async getConfig() {
    return this.prisma.chatbotConfig.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
  }

  /** Public subset of the config the widget needs (chip answers stay server-side). */
  async getPublicConfig() {
    const c = await this.getConfig();
    return {
      enabled: c.enabled,
      botName: c.botName,
      welcomeMessage: c.welcomeMessage,
      accentColor: c.accentColor,
      position: c.position,
      launcherIcon: c.launcherIcon,
      launcherIconUrl: c.launcherIconUrl,
      headerSubtitle: c.headerSubtitle,
      showAgentHandoff: c.showAgentHandoff,
      teamName: c.teamName,
      teamSubtitle: c.teamSubtitle,
      quickReplies: this.publicQuickReplies(this.parseQuickReplies(c.quickReplies)),
    };
  }

  async updateConfig(dto: UpdateChatbotConfigDto) {
    const data = dto as any;
    return this.prisma.chatbotConfig.upsert({
      where: { id: CONFIG_ID },
      update: data,
      create: { id: CONFIG_ID, ...data },
    });
  }

  /** Agent saved replies only — accessible to team members (config is admin-only). */
  async getCannedReplies() {
    const c = await this.getConfig();
    const list = Array.isArray(c.cannedReplies) ? c.cannedReplies : [];
    return { cannedReplies: list };
  }

  private isAdmin(user: ChatUser): boolean {
    return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
  }

  /** Team members may only touch conversations assigned to them. */
  private assertCanAccess(convo: { assignedToId: string | null }, user: ChatUser) {
    if (!this.isAdmin(user) && convo.assignedToId !== user.id) {
      throw new ForbiddenException('This conversation is not assigned to you.');
    }
  }

  private parseQuickReplies(value: unknown): QuickReplyNode[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((v): v is Record<string, unknown> => !!v && typeof (v as any).label === 'string')
      .map((v) => ({
        label: v.label as string,
        reply: typeof v.reply === 'string' ? v.reply : undefined,
        children: this.parseQuickReplies(v.children),
      }));
  }

  /** Strip server-only answer text, keeping the label/children tree for the widget. */
  private publicQuickReplies(nodes: QuickReplyNode[]): PublicQuickReply[] {
    return nodes.map((n) => ({
      label: n.label,
      ...(n.children.length ? { children: this.publicQuickReplies(n.children) } : {}),
    }));
  }

  /** Depth-first search for a chip whose label matches and has a canned answer. */
  private findInTree(nodes: QuickReplyNode[], norm: string): string | null {
    for (const n of nodes) {
      if (n.label.trim().toLowerCase() === norm && n.reply && n.reply.trim().length > 0) {
        return n.reply.trim();
      }
      const child = this.findInTree(n.children, norm);
      if (child) return child;
    }
    return null;
  }

  /** A configured chip (at any depth) whose label matches the message. */
  private async findCannedReply(content: string): Promise<string | null> {
    const config = await this.getConfig();
    return this.findInTree(this.parseQuickReplies(config.quickReplies), content.trim().toLowerCase());
  }

  // ---- visitor flow ---------------------------------------------------------

  async startConversation(dto: StartConversationDto) {
    const config = await this.getConfig();
    if (!config.enabled) {
      throw new ForbiddenException('Chat is currently disabled.');
    }

    // We keep the visitor's name/email on the conversation, but do NOT create a
    // CRM lead yet — a lead is created only when they send their first actual
    // message (see captureLead), so chat openers who never engage aren't leads.
    const visitorToken = `${randomUUID()}.${randomUUID()}`;
    const conversation = await this.prisma.conversation.create({
      data: {
        visitorToken,
        visitorName: dto.visitorName,
        visitorEmail: dto.visitorEmail,
        messages: {
          create: { role: ChatRole.AI, content: config.welcomeMessage },
        },
      },
      include: { messages: true },
    });

    this.gateway.emitToAgents('conversation:new', this.serializeSummary(conversation));

    return {
      conversationId: conversation.id,
      visitorToken,
      botName: config.botName,
      accentColor: config.accentColor,
      status: conversation.status,
      messages: conversation.messages.map((m) => this.serializeMessage(m)),
    };
  }

  /** Notify the visitor's widget that the conversation status changed. */
  private emitStatusToVisitor(id: string, status: ConversationStatus) {
    this.gateway.emitToConversation(id, 'conversation:status', { status });
  }

  private async loadVisitorConversation(id: string, token: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo || convo.visitorToken !== token) {
      throw new NotFoundException('Conversation not found.');
    }
    return convo;
  }

  async getVisitorMessages(id: string, token: string) {
    const convo = await this.loadVisitorConversation(id, token);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });
    return { status: convo.status, messages: messages.map((m) => this.serializeMessage(m)) };
  }

  async handleVisitorMessage(id: string, token: string, content: string) {
    const convo = await this.loadVisitorConversation(id, token);

    // Re-engaging a closed chat reopens it with the AI so the visitor can
    // continue (e.g. by tapping a quick-reply chip again).
    if (convo.status === ConversationStatus.CLOSED) {
      await this.prisma.conversation.update({
        where: { id },
        data: { status: ConversationStatus.BOT, assignedToId: null },
      });
      convo.status = ConversationStatus.BOT;
      this.emitStatusToVisitor(id, ConversationStatus.BOT);
      this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    }

    const userMsg = await this.addMessage(id, ChatRole.USER, content);
    await this.captureLead(id, content);

    // A human is handling it — don't let the AI answer, just flag the inbox.
    if (
      convo.status === ConversationStatus.AGENT ||
      convo.status === ConversationStatus.WAITING_AGENT
    ) {
      await this.flagUnread(id);
      return { messages: [this.serializeMessage(userMsg)] };
    }

    // BOT mode: an admin-configured chip with a canned answer replies instantly;
    // otherwise produce an AI reply (or a graceful fallback + route to team).
    const canned = await this.findCannedReply(content);
    const reply = canned
      ? await this.addMessage(id, ChatRole.AI, canned)
      : await this.generateBotReply(id);
    const out = [this.serializeMessage(userMsg)];
    if (reply) out.push(this.serializeMessage(reply));
    return { messages: out };
  }

  async requestAgent(id: string, token: string) {
    await this.loadVisitorConversation(id, token);
    await this.prisma.conversation.update({
      where: { id },
      data: { status: ConversationStatus.WAITING_AGENT, unreadForAgent: true },
    });
    // Route the request to an available team member automatically.
    await this.autoAssignAgent(id);
    const sys = await this.addMessage(
      id,
      ChatRole.SYSTEM,
      "You're being connected to our team — someone will reply here shortly.",
    );
    this.emitStatusToVisitor(id, ConversationStatus.WAITING_AGENT);
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));

    // In-app bell: a live visitor is waiting for the team.
    const convoInfo = await this.prisma.conversation
      .findUnique({ where: { id }, select: { visitorName: true } })
      .catch(() => null);
    void this.notifications.create({
      type: NotificationType.CHAT_HANDOFF,
      title: `Live chat: ${convoInfo?.visitorName || 'A visitor'} requested an agent`,
      body: 'A visitor is waiting to chat with the team.',
      link: '/admin/chat',
    });

    return { messages: [this.serializeMessage(sys)] };
  }

  /**
   * Auto-assign a conversation to an available team member: prefer ones who are
   * currently online (connected to the inbox), and load-balance by the number
   * of open chats they already hold. No-op if no eligible team member exists.
   */
  private async autoAssignAgent(conversationId: string): Promise<string | null> {
    const eligible = await this.prisma.user.findMany({
      where: { role: Role.TEAM_MEMBER, permissions: { has: 'chat' } },
      select: { id: true },
    });
    if (eligible.length === 0) return null;

    const onlineIds = new Set(this.gateway.getOnlineAgentIds());
    const online = eligible.filter((u) => onlineIds.has(u.id));
    const pool = online.length ? online : eligible;

    const counts = await Promise.all(
      pool.map(async (u) => ({
        id: u.id,
        load: await this.prisma.conversation.count({
          where: { assignedToId: u.id, status: { not: ConversationStatus.CLOSED } },
        }),
      })),
    );
    counts.sort((a, b) => a.load - b.load);
    const picked = counts[0];
    if (!picked) return null;

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedToId: picked.id },
    });
    this.logger.log(`Auto-assigned conversation ${conversationId} to ${picked.id}.`);
    return picked.id;
  }

  // ---- agent / admin flow ---------------------------------------------------

  async listConversations(user: ChatUser, status?: string) {
    const where: any = status ? { status: status as ConversationStatus } : {};
    // Team members see only conversations assigned to them.
    if (!this.isAdmin(user)) where.assignedToId = user.id;
    const conversations = await this.prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    return conversations.map((c) => this.serializeSummary(c));
  }

  async getConversation(id: string, user?: ChatUser) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        assignedTo: { select: { id: true, name: true, email: true } },
        lead: true,
        notes: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });
    if (!convo) throw new NotFoundException('Conversation not found.');
    if (user) this.assertCanAccess(convo, user);
    return {
      ...this.serializeSummary(convo),
      lead: convo.lead,
      messages: convo.messages.map((m) => this.serializeMessage(m)),
      notes: convo.notes.map((n) => ({
        id: n.id,
        content: n.content,
        author: n.author?.name || 'Team',
        createdAt: n.createdAt,
      })),
    };
  }

  /** Add an internal team-only note to a conversation. */
  async addNote(id: string, user: ChatUser, content: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');
    this.assertCanAccess(convo, user);
    await this.prisma.conversationNote.create({
      data: { conversationId: id, authorId: user.id, content },
    });
    return this.getConversation(id);
  }

  /** Assign (or unassign with null) a conversation to a team member. */
  async assignConversation(id: string, assigneeId?: string | null) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');
    await this.prisma.conversation.update({
      where: { id },
      data: { assignedToId: assigneeId || null },
    });
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    return this.getConversation(id);
  }

  /** Team members available to assign conversations to. */
  async listAgents() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
  }

  /** Count of conversations that need attention (waiting for an agent or unread). */
  async unreadCount(user: ChatUser) {
    const where: any = {
      status: { not: ConversationStatus.CLOSED },
      OR: [{ status: ConversationStatus.WAITING_AGENT }, { unreadForAgent: true }],
    };
    // Team members only count conversations assigned to them.
    if (!this.isAdmin(user)) where.assignedToId = user.id;
    const count = await this.prisma.conversation.count({ where });
    return { count };
  }

  /** Aggregate stats for the chat dashboard. */
  async stats() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const since7 = new Date(now - 7 * dayMs);

    const [total, recent, humanHandled, leadsFromChat, byDayRaw] = await Promise.all([
      this.prisma.conversation.count(),
      this.prisma.conversation.findMany({
        where: { createdAt: { gte: since7 } },
        select: { createdAt: true },
      }),
      // Conversations that ever involved a human agent.
      this.prisma.conversation.count({
        where: { messages: { some: { role: ChatRole.AGENT } } },
      }),
      this.prisma.lead.count({ where: { type: 'chat' } }),
      this.prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
        `SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
         FROM "Conversation" WHERE "createdAt" >= $1
         GROUP BY day ORDER BY day ASC`,
        since7,
      ).catch(() => [] as { day: Date; count: bigint }[]),
    ]);

    const aiOnly = Math.max(0, total - humanHandled);
    const byDay = byDayRaw.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      count: Number(r.count),
    }));

    return {
      total,
      last7Days: recent.length,
      perDayAvg: Math.round((recent.length / 7) * 10) / 10,
      humanHandled,
      aiOnly,
      leadsFromChat,
      byDay,
    };
  }

  /** Export every conversation's transcript as CSV (one row per message). */
  async exportCsv(): Promise<string> {
    const convos = await this.prisma.conversation.findMany({
      orderBy: { createdAt: 'asc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['conversationId', 'visitorName', 'visitorEmail', 'status', 'role', 'message', 'sentAt'].join(','),
    ];
    for (const c of convos) {
      for (const m of c.messages) {
        rows.push(
          [
            esc(c.id),
            esc(c.visitorName),
            esc(c.visitorEmail),
            esc(c.status),
            esc(m.role),
            esc(m.content),
            esc(m.createdAt.toISOString()),
          ].join(','),
        );
      }
    }
    return rows.join('\n');
  }

  async agentReply(id: string, user: ChatUser, content: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');
    this.assertCanAccess(convo, user);

    // First time a human steps in: announce it and take the AI out of the loop.
    if (convo.status !== ConversationStatus.AGENT) {
      await this.transitionToAgent(id, user.id);
    }

    const msg = await this.prisma.chatMessage.create({
      data: { conversationId: id, role: ChatRole.AGENT, content, senderId: user.id },
    });
    await this.prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date(), unreadForAgent: false },
    });

    const serialized = this.serializeMessage(msg);
    this.gateway.emitToConversation(id, 'message', serialized);
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    return serialized;
  }

  async updateConversation(id: string, user: ChatUser, dto: ConversationActionDto) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');
    this.assertCanAccess(convo, user);

    if (dto.action === 'takeover') {
      await this.transitionToAgent(id, user.id);
    } else if (dto.action === 'release') {
      await this.prisma.conversation.update({
        where: { id },
        data: { status: ConversationStatus.BOT, assignedToId: null },
      });
      await this.addMessage(
        id,
        ChatRole.SYSTEM,
        "You're back with the AI assistant. Ask away!",
      );
      this.emitStatusToVisitor(id, ConversationStatus.BOT);
    } else if (dto.action === 'close') {
      await this.prisma.conversation.update({
        where: { id },
        data: { status: ConversationStatus.CLOSED, unreadForAgent: false },
      });
      await this.addMessage(id, ChatRole.SYSTEM, 'This conversation has been closed.');
      this.emitStatusToVisitor(id, ConversationStatus.CLOSED);
    } else if (dto.action === 'reopen') {
      // Back to the AI by default; an agent can take it over again afterwards.
      await this.prisma.conversation.update({
        where: { id },
        data: { status: ConversationStatus.BOT, assignedToId: null },
      });
      await this.addMessage(id, ChatRole.SYSTEM, 'This conversation has been reopened.');
      this.emitStatusToVisitor(id, ConversationStatus.BOT);
    }

    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    return this.getConversation(id);
  }

  /** Permanently delete a conversation (and its messages). The linked lead is kept. */
  async deleteConversation(id: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');
    await this.prisma.conversation.delete({ where: { id } });
    this.gateway.emitToConversation(id, 'conversation:deleted', { id });
    this.gateway.emitToAgents('conversation:deleted', { id });
    return { id, deleted: true };
  }

  /**
   * Data retention: once a day, delete conversations whose last activity is
   * older than the admin-configured retentionDays (0 = keep forever). Linked
   * leads are preserved (the relation is set-null, not cascaded).
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeOldConversations() {
    const config = await this.getConfig();
    if (!config.retentionDays || config.retentionDays <= 0) return;
    const cutoff = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.conversation.deleteMany({
      where: { lastMessageAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(
        `Retention: purged ${result.count} conversation(s) inactive for >${config.retentionDays}d.`,
      );
    }
  }

  // ---- internals ------------------------------------------------------------

  private async transitionToAgent(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await this.prisma.conversation.update({
      where: { id },
      data: { status: ConversationStatus.AGENT, assignedToId: userId },
    });
    await this.addMessage(
      id,
      ChatRole.SYSTEM,
      `${user?.name || 'A team member'} from the team has joined the chat.`,
    );
    this.emitStatusToVisitor(id, ConversationStatus.AGENT);
  }

  private async addMessage(id: string, role: ChatRole, content: string) {
    const msg = await this.prisma.chatMessage.create({
      data: { conversationId: id, role, content },
    });
    await this.prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });
    this.gateway.emitToConversation(id, 'message', this.serializeMessage(msg));
    return msg;
  }

  private async flagUnread(id: string) {
    await this.prisma.conversation.update({
      where: { id },
      data: { unreadForAgent: true },
    });
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
  }

  /** Generate + persist the AI's reply, or a graceful fallback that pages the team. */
  private async generateBotReply(id: string) {
    const config = await this.getConfig();

    if (!config.aiEnabled || !this.ai.isConfigured()) {
      await this.flagUnread(id);
      return this.addMessage(id, ChatRole.AI, config.offlineMessage);
    }

    const [history, services] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' },
        take: 40,
      }),
      this.prisma.service.findMany({
        select: { title: true, excerpt: true },
        take: 30,
      }),
    ]);

    const settings = await this.prisma.siteSetting
      .findUnique({ where: { id: 'global' } })
      .catch(() => null);

    const aiHistory: AiMessage[] = history
      .filter((m) => m.role !== ChatRole.SYSTEM)
      .map((m) => ({
        role: m.role === ChatRole.USER ? 'user' : 'assistant',
        content: m.content,
      }));

    const servicesContext = services
      .map((s) => `- ${s.title}${s.excerpt ? `: ${s.excerpt}` : ''}`)
      .join('\n');

    const { text, rateLimited } = await this.ai.generateReply({
      botName: config.botName,
      siteName: settings?.siteName || 'HexaPixora',
      model: config.aiModel,
      servicesContext,
      extraSystemPrompt: config.systemPrompt,
      collectLeads: config.collectLeads,
      history: aiHistory,
    });

    // Provider throttled us — alert the team so a human can step in.
    if (rateLimited) {
      this.gateway.emitToAgents('ai:rate-limited', {
        conversationId: id,
        at: new Date().toISOString(),
      });
      await this.flagUnread(id);
    }

    return this.addMessage(id, ChatRole.AI, text || config.offlineMessage);
  }

  /**
   * Lead qualification, run on every visitor message. Creates a linked CRM Lead
   * on the visitor's FIRST message (using the email from the pre-chat form, or
   * one typed into the chat), so chat openers who never engage aren't leads.
   */
  private async captureLead(id: string, content: string) {
    const config = await this.getConfig();
    if (!config.collectLeads) return;

    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) return;

    const found = this.ai.extractContact(content);
    const email = found.email || convo.visitorEmail || undefined;
    const name = found.name || convo.visitorName || undefined;

    // Persist any newly-learned contact details onto the conversation.
    if (found.email || found.name) {
      await this.prisma.conversation.update({
        where: { id },
        data: { visitorEmail: email, visitorName: name },
      });
    }

    // Need an email to make the lead actionable; wait until we have one.
    if (!email) return;

    if (convo.leadId) {
      await this.prisma.lead.update({
        where: { id: convo.leadId },
        data: { email, ...(name ? { name } : {}) },
      });
      return;
    }

    const firstUserMsg = await this.prisma.chatMessage.findFirst({
      where: { conversationId: id, role: ChatRole.USER },
      orderBy: { createdAt: 'asc' },
    });

    const leadId = await this.findOrCreateChatLead(
      email,
      name,
      firstUserMsg?.content?.slice(0, 4000),
    );
    await this.prisma.conversation.update({ where: { id }, data: { leadId } });
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
  }

  /**
   * Reuse an existing lead with the same email (case-insensitive) instead of
   * creating a duplicate on repeat visits; otherwise create a new chat lead.
   */
  private async findOrCreateChatLead(
    email: string,
    name?: string,
    message?: string,
  ): Promise<string> {
    const existing = await this.prisma.lead.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      // Backfill the name if we now know it and it was a placeholder.
      if (name && (!existing.name || existing.name === 'Chat visitor')) {
        await this.prisma.lead.update({ where: { id: existing.id }, data: { name } });
      }
      return existing.id;
    }
    const lead = await this.prisma.lead.create({
      data: {
        name: name || 'Chat visitor',
        email,
        type: 'chat',
        message: message || 'Started a chat conversation.',
      },
    });
    return lead.id;
  }

  private async summaryById(id: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    return convo ? this.serializeSummary(convo) : null;
  }

  private serializeMessage(m: {
    id: string;
    role: ChatRole;
    content: string;
    senderId?: string | null;
    createdAt: Date;
  }) {
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      senderId: m.senderId ?? null,
      createdAt: m.createdAt,
    };
  }

  private serializeSummary(c: any) {
    const last = Array.isArray(c.messages) ? c.messages[0] : undefined;
    return {
      id: c.id,
      status: c.status,
      visitorName: c.visitorName ?? null,
      visitorEmail: c.visitorEmail ?? null,
      assignedTo: c.assignedTo ?? null,
      leadId: c.leadId ?? null,
      unreadForAgent: c.unreadForAgent ?? false,
      lastMessageAt: c.lastMessageAt,
      lastMessage: last ? { role: last.role, content: last.content } : null,
      createdAt: c.createdAt,
    };
  }
}
