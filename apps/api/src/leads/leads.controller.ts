import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // Public — contact form submissions. Returns only a generated id (never the
  // submitted values) so no user-provided data is reflected in the response.
  // Tight per-IP limit on top of the honeypot to blunt automated spam.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post()
  async create(@Body() body: CreateLeadDto) {
    const lead = await this.leadsService.create(body);
    return { success: true, id: lead.id };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('leads')
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.leadsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('leads')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateLeadStatusDto) {
    return this.leadsService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('leads')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
