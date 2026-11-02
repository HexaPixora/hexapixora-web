import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { env } from './config/env';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Bare liveness ping (/api) for the host's health check — no DB round-trip.
  @Get()
  ping() {
    return { status: 'ok' };
  }

  // Readiness probe with a DB round-trip: 200 when the database answers, 503
  // otherwise (same payload), so the web app can switch to maintenance mode.
  @Get('health')
  async health() {
    const result = await this.appService.health();
    if (result.db !== 'up') throw new ServiceUnavailableException(result);
    return result;
  }

  // Which optional features this site runs, so the site and admin can hide
  // what is switched off. Public: it reveals only on/off flags.
  @Get('features')
  features() {
    return { data: env.features };
  }
}
