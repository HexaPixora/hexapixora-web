import {
  BadRequestException,
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LayoutsService } from './layouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

// Layout documents the admin saves. The body is free-form JSON on purpose (a
// header config object, a navigations array), so it is checked here rather
// than with a DTO: the global whitelist pipe would strip every undeclared key.
const LAYOUT_KEYS = [
  'header',
  'footer',
  'navigations',
  'module-defaults',
] as const;

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
  upsert(@Param('key') key: string, @Body() body: unknown) {
    if (!(LAYOUT_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestException(`Unknown layout "${key}"`);
    }
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException(
        'Layout data must be a JSON object or array',
      );
    }
    return this.layoutsService.upsert(key, body);
  }
}
