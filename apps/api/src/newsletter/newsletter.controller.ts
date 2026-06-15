import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // Public subscription
  @Post('subscribe')
  subscribe(@Body() body: SubscribeDto) {
    return this.newsletterService.subscribe(body.email);
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
