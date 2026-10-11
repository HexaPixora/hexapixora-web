import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AutomationService } from './automation.service';
import { AutomationKeyGuard } from './automation-key.guard';
import { AutomationPostDto } from './dto/automation-post.dto';

// Narrow, key-authenticated surface for the scheduled Claude routines. It can
// read context/reports and add posts — nothing here edits or deletes content.
@Controller('automation')
@UseGuards(AutomationKeyGuard)
@Throttle({ default: { ttl: 60_000, limit: 20 } })
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}

  @Get('context')
  context() {
    return this.automation.context();
  }

  @Post('posts')
  createPost(@Body() body: AutomationPostDto) {
    return this.automation.createPost(body);
  }

  @Get('report')
  report(@Query('days') days?: string) {
    const n = Math.min(Math.max(parseInt(days ?? '7', 10) || 7, 1), 90);
    return this.automation.report(n);
  }
}
