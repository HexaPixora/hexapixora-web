import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Role } from '@hexapixora/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/auth.types';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /** Any signed-in user; each section only for those with its permission (as the guards decide elsewhere). */
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  summary(@Req() req: AuthRequest) {
    const user = req.user!;
    const admin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    const may = (section: string) =>
      admin || user.permissions.includes(section);
    return this.dashboard.summary({
      leads: may('leads'),
      newsletter: may('newsletter'),
      pages: may('pages'),
      blogs: may('blogs'),
    });
  }
}
