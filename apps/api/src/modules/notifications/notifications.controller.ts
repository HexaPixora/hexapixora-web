import { Body, Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { PushSubscribeDto, PushUnsubscribeDto } from './dto/push.dto';

// In-app notification feed for any logged-in admin/team member.
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  @Get()
  list(@Query('limit') limit?: string) {
    return this.notifications.findRecent(limit ? parseInt(limit, 10) : 30);
  }

  // --- Web Push ---

  @Get('vapid-key')
  vapidKey() {
    return { key: this.push.publicKey() };
  }

  @Post('push/subscribe')
  subscribe(@CurrentUser() user: { id: string }, @Body() body: PushSubscribeDto) {
    return this.push.subscribe(user.id, body);
  }

  @Post('push/unsubscribe')
  unsubscribe(@Body() body: PushUnsubscribeDto) {
    return this.push.unsubscribe(body.endpoint);
  }

  @Get('unread-count')
  async unread() {
    return { count: await this.notifications.unreadCount() };
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }

  @Post('read-all')
  markAllRead() {
    return this.notifications.markAllRead();
  }
}
