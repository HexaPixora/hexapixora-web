import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
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

  // ---- Admin (team) ---------------------------------------------------------

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/config')
  getConfig() {
    return this.chat.getConfig();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Put('admin/config')
  updateConfig(@Body() dto: UpdateChatbotConfigDto) {
    return this.chat.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/conversations')
  list(@Query('status') status?: string) {
    return this.chat.listConversations(status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Get('admin/conversations/:id')
  getOne(@Param('id') id: string) {
    return this.chat.getConversation(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Post('admin/conversations/:id/messages')
  agentReply(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SendMessageDto,
  ) {
    return this.chat.agentReply(id, user.id, dto.content);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('chat')
  @Patch('admin/conversations/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ConversationActionDto,
  ) {
    return this.chat.updateConversation(id, user.id, dto);
  }

  private requireToken(token?: string): string {
    if (!token) throw new UnauthorizedException('Missing visitor token.');
    return token;
  }
}
