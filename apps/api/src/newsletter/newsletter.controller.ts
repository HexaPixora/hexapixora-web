import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SubscribeDto } from './dto/subscribe.dto';
import { CreateCampaignDto, TestCampaignDto, UnsubscribeDto } from './dto/campaign.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // Public subscription
  @Post('subscribe')
  subscribe(@Body() body: SubscribeDto) {
    return this.newsletterService.subscribe(body.email, body.name);
  }

  // Public unsubscribe (via the signed token embedded in every campaign email).
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('unsubscribe')
  unsubscribe(@Body() body: UnsubscribeDto) {
    return this.newsletterService.unsubscribeByToken(body.token);
  }

  // --- Campaigns (admin, 'newsletter' permission) ---

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Get('campaigns')
  listCampaigns() {
    return this.newsletterService.listCampaigns();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Post('campaigns')
  createCampaign(@Body() body: CreateCampaignDto) {
    return this.newsletterService.createCampaign(body);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Post('campaigns/test')
  sendTest(@Body() body: TestCampaignDto) {
    return this.newsletterService.sendTest(body);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Post('campaigns/:id/send')
  sendCampaign(@Param('id') id: string) {
    return this.newsletterService.sendCampaign(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Get('subscribers')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.newsletterService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletter')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }
}
