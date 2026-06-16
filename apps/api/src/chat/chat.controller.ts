import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@repo/database';
import { ChatService } from './chat.service';
import type { ChatUser } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  AddNoteDto,
  AssignConversationDto,
  ConversationActionDto,
  SendMessageDto,
  StartConversationDto,
  UpdateChatbotConfigDto,
} from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // ---- Public (website visitor) --------------------------------------------

  @Get('config')
  getPublicConfig() {
    return this.chat.getPublicConfig();
  }

  @Post('start')
  start(@Body() dto: StartConversationDto) {
    return this.chat.startConversation(dto);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Headers('x-visitor-token') token: string,
  ) {
    return this.chat.getVisitorMessages(id, this.requireToken(token));
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Headers('x-visitor-token') token: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chat.handleVisitorMessage(id, this.requireToken(token), dto.content);
  }

  @Post(':id/request-agent')
  requestAgent(
    @Param('id') id: string,
    @Headers('x-visitor-token') token: string,
  ) {
    return this.chat.requestAgent(id, this.requireToken(token));
  }

  // ---- Admin only (ADMIN / SUPER_ADMIN): chatbot config & management --------

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/config')
  getConfig() {
    return this.chat.getConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('admin/config')
  updateConfig(@Body() dto: UpdateChatbotConfigDto) {
    return this.chat.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/stats')
  stats() {
    return this.chat.stats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/agents')
  agents() {
    return this.chat.listAgents();
  }

  // ---- Team-accessible (chat permission), scoped to assigned conversations --

  // Agent saved replies (subset of config) — usable by team members.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/canned')
  canned() {
    return this.chat.getCannedReplies();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/conversations')
  list(@CurrentUser() user: ChatUser, @Query('status') status?: string) {
    return this.chat.listConversations(user, status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/unread-count')
  unreadCount(@CurrentUser() user: ChatUser) {
    return this.chat.unreadCount(user);
  }

  // Export is admin-only (it dumps every conversation). Declared before ':id'.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/conversations/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="conversations.csv"')
  exportCsv() {
    return this.chat.exportCsv();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/conversations/:id')
  getOne(@Param('id') id: string, @CurrentUser() user: ChatUser) {
    return this.chat.getConversation(id, user);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Post('admin/conversations/:id/messages')
  agentReply(
    @Param('id') id: string,
    @CurrentUser() user: ChatUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.chat.agentReply(id, user, dto.content);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Patch('admin/conversations/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: ChatUser,
    @Body() dto: ConversationActionDto,
  ) {
    return this.chat.updateConversation(id, user, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Post('admin/conversations/:id/notes')
  addNote(
    @Param('id') id: string,
    @CurrentUser() user: ChatUser,
    @Body() dto: AddNoteDto,
  ) {
    return this.chat.addNote(id, user, dto.content);
  }

  // Assigning and deleting are admin actions.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/conversations/:id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignConversationDto) {
    return this.chat.assignConversation(id, dto.assigneeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/conversations/:id')
  remove(@Param('id') id: string) {
    return this.chat.deleteConversation(id);
  }

  private requireToken(token?: string): string {
    if (!token) throw new UnauthorizedException('Missing visitor token.');
    return token;
  }
}
