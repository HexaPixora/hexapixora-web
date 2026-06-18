import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { env } from '../config/env';

/**
 * Hands the shared preview token to authenticated admins so the editor can build
 * a Draft Mode preview link for the live site. Any logged-in user may fetch it;
 * the token itself is the gate that unlocks unpublished content on the public
 * app. Returns 403 when preview is not configured (PREVIEW_TOKEN unset).
 */
@Controller('preview')
export class PreviewController {
  @UseGuards(JwtAuthGuard)
  @Get('token')
  getToken() {
    if (!env.previewToken) {
      throw new ForbiddenException(
        'Preview is not configured. Set PREVIEW_TOKEN on the API (and web app) to enable draft previews.',
      );
    }
    return { token: env.previewToken };
  }
}
