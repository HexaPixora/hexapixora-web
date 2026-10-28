import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { LayoutsService } from './layouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  // Public — frontend needs the menu config to render navigation
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.layoutsService.findByKey(key);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: any) {
    return this.layoutsService.upsert(key, body);
  }
}
