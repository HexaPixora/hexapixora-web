import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Bare liveness ping — Render's healthCheckPath hits this (/api).
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Readiness probe with a DB round-trip. Returns db:"down" instead of throwing
  // so the payload stays inspectable by monitors.
  @Get('health')
  health() {
    return this.appService.health();
  }
}
