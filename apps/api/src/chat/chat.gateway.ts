import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../config/env';

function roomFor(conversationId: string): string {
  return `conv:${conversationId}`;
}

const AGENTS_ROOM = 'agents';

/**
 * Realtime transport for the support chat. Writes still go through the REST
 * controller (so AI generation runs in a normal request context); this gateway
 * only broadcasts the resulting messages/updates to the right participants:
 *
 *  - visitors authenticate with their conversationId + visitorToken and join
 *    only their own conversation room.
 *  - team members authenticate via the `access_token` cookie and join a shared
 *    `agents` room (inbox updates) plus any conversation they actively open.
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: env.corsOrigins, credentials: true },
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const auth = (socket.handshake.auth ?? {}) as {
        conversationId?: string;
        visitorToken?: string;
      };

      // Visitor connection.
      if (auth.conversationId && auth.visitorToken) {
        const convo = await this.prisma.conversation.findUnique({
          where: { id: auth.conversationId },
          select: { id: true, visitorToken: true },
        });
        if (convo && convo.visitorToken === auth.visitorToken) {
          socket.data.role = 'visitor';
          socket.data.conversationId = convo.id;
          await socket.join(roomFor(convo.id));
          return;
        }
        socket.disconnect(true);
        return;
      }

      // Agent connection — verify the JWT access-token cookie.
      const userId = this.userIdFromCookie(socket.handshake.headers.cookie);
      if (userId) {
        socket.data.role = 'agent';
        socket.data.userId = userId;
        await socket.join(AGENTS_ROOM);
        return;
      }

      socket.disconnect(true);
    } catch (err) {
      this.logger.warn(`Rejected socket connection: ${(err as Error).message}`);
      socket.disconnect(true);
    }
  }

  /** Agents opening a conversation in the inbox subscribe to its live messages. */
  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId?: string },
  ): Promise<void> {
    if (socket.data.role !== 'agent' || !data?.conversationId) return;
    await socket.join(roomFor(data.conversationId));
  }

  @SubscribeMessage('leaveConversation')
  async leaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId?: string },
  ): Promise<void> {
    if (!data?.conversationId) return;
    await socket.leave(roomFor(data.conversationId));
  }

  private userIdFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('access_token='));
    if (!match) return null;
    const token = decodeURIComponent(match.slice('access_token='.length));
    try {
      const payload = this.jwt.verify(token, { secret: env.jwtAccessSecret });
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }

  // ---- emit helpers used by ChatService -------------------------------------

  emitToConversation(conversationId: string, event: string, payload: any): void {
    this.server?.to(roomFor(conversationId)).emit(event, payload);
  }

  emitToAgents(event: string, payload: any): void {
    this.server?.to(AGENTS_ROOM).emit(event, payload);
  }
}
