import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChatRole, ConversationStatus } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { ChatAiService, AiMessage } from './chat-ai.service';
import { ChatGateway } from './chat.gateway';
import {
  ConversationActionDto,
  StartConversationDto,
  UpdateChatbotConfigDto,
} from './dto/chat.dto';

const CONFIG_ID = 'global';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private ai: ChatAiService,
    private gateway: ChatGateway,
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
      headerSubtitle: c.headerSubtitle,
      showAgentHandoff: c.showAgentHandoff,
      teamName: c.teamName,
      quickReplies: this.parseQuickReplies(c.quickReplies).map((q) => ({ label: q.label })),
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

  private parseQuickReplies(value: unknown): { label: string; reply?: string }[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((v): v is { label: string; reply?: unknown } =>
        !!v && typeof (v as any).label === 'string',
      )
      .map((v) => ({
        label: v.label,
        reply: typeof v.reply === 'string' ? v.reply : undefined,
      }));
  }

  /** A configured chip whose label matches the message and has a canned answer. */
  private async findCannedReply(content: string): Promise<string | null> {
    const config = await this.getConfig();
    const norm = content.trim().toLowerCase();
    const match = this.parseQuickReplies(config.quickReplies).find(
      (c) => c.label.trim().toLowerCase() === norm && c.reply && c.reply.trim().length > 0,
    );
    return match?.reply?.trim() || null;
  }

  // ---- visitor flow ---------------------------------------------------------

  async startConversation(dto: StartConversationDto) {
    const config = await this.getConfig();
    if (!config.enabled) {
      throw new ForbiddenException('Chat is currently disabled.');
    }

    // The widget gates the chat behind a name + email form, so we usually have
    // contact details up front — turn them into a CRM lead immediately.
    let leadId: string | undefined;
    if (config.collectLeads && dto.visitorEmail) {
      const lead = await this.prisma.lead.create({
        data: {
          name: dto.visitorName || 'Chat visitor',
          email: dto.visitorEmail,
          type: 'chat',
          message: 'Started a chat conversation.',
        },
      });
      leadId = lead.id;
    }

    const visitorToken = `${randomUUID()}.${randomUUID()}`;
    const conversation = await this.prisma.conversation.create({
      data: {
        visitorToken,
        visitorName: dto.visitorName,
        visitorEmail: dto.visitorEmail,
        leadId,
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
      messages: conversation.messages.map((m) => this.serializeMessage(m)),
    };
  }

  private async loadVisitorConversation(id: string, token: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo || convo.visitorToken !== token) {
      throw new NotFoundException('Conversation not found.');
    }
    return convo;
  }

  async getVisitorMessages(id: string, token: string) {
    await this.loadVisitorConversation(id, token);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });
    return { messages: messages.map((m) => this.serializeMessage(m)) };
  }

  async handleVisitorMessage(id: string, token: string, content: string) {
    const convo = await this.loadVisitorConversation(id, token);
    if (convo.status === ConversationStatus.CLOSED) {
      throw new ForbiddenException('This conversation has been closed.');
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
    const sys = await this.addMessage(
      id,
      ChatRole.SYSTEM,
      "You're being connected to our team — someone will reply here shortly.",
    );
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    return { messages: [this.serializeMessage(sys)] };
  }

  // ---- agent / admin flow ---------------------------------------------------

  async listConversations(status?: string) {
    const where = status ? { status: status as ConversationStatus } : {};
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

  async getConversation(id: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        assignedTo: { select: { id: true, name: true, email: true } },
        lead: true,
      },
    });
    if (!convo) throw new NotFoundException('Conversation not found.');
    return {
      ...this.serializeSummary(convo),
      lead: convo.lead,
      messages: convo.messages.map((m) => this.serializeMessage(m)),
    };
  }

  async agentReply(id: string, userId: string, content: string) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');

    // First time a human steps in: announce it and take the AI out of the loop.
    if (convo.status !== ConversationStatus.AGENT) {
      await this.transitionToAgent(id, userId);
    }

    const msg = await this.prisma.chatMessage.create({
      data: { conversationId: id, role: ChatRole.AGENT, content, senderId: userId },
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

  async updateConversation(id: string, userId: string, dto: ConversationActionDto) {
    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) throw new NotFoundException('Conversation not found.');

    if (dto.action === 'takeover') {
      await this.transitionToAgent(id, userId);
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
    } else if (dto.action === 'close') {
      await this.prisma.conversation.update({
        where: { id },
        data: { status: ConversationStatus.CLOSED, unreadForAgent: false },
      });
      await this.addMessage(id, ChatRole.SYSTEM, 'This conversation has been closed.');
    }

    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
    return this.getConversation(id);
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

    const reply = await this.ai.generateReply({
      botName: config.botName,
      siteName: settings?.siteName || 'HexaPixora',
      model: config.aiModel,
      servicesContext,
      extraSystemPrompt: config.systemPrompt,
      collectLeads: config.collectLeads,
      history: aiHistory,
    });

    return this.addMessage(id, ChatRole.AI, reply || config.offlineMessage);
  }

  /**
   * Lead qualification: pull name/email out of what the visitor typed and,
   * once we have an email, create (or update) a linked CRM Lead.
   */
  private async captureLead(id: string, content: string) {
    const config = await this.getConfig();
    if (!config.collectLeads) return;

    const found = this.ai.extractContact(content);
    if (!found.email && !found.name) return;

    const convo = await this.prisma.conversation.findUnique({ where: { id } });
    if (!convo) return;

    const email = found.email || convo.visitorEmail || undefined;
    const name = found.name || convo.visitorName || undefined;

    await this.prisma.conversation.update({
      where: { id },
      data: { visitorEmail: email, visitorName: name },
    });

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

    const lead = await this.prisma.lead.create({
      data: {
        name: name || 'Chat visitor',
        email,
        type: 'chat',
        message: firstUserMsg?.content?.slice(0, 4000) || 'Started a chat conversation.',
      },
    });
    await this.prisma.conversation.update({
      where: { id },
      data: { leadId: lead.id },
    });
    this.gateway.emitToAgents('conversation:updated', await this.summaryById(id));
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
