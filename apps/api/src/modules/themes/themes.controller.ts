import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { PACK_LIMITS } from '@hexapixora/contracts/theme-pack/files';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ThemesService } from './themes.service';

const ASSET_FILE = /^[a-z0-9][a-z0-9._-]{0,80}\.[a-z0-9]+$/;
const PREVIEW_TOKEN = /^[A-Za-z0-9._-]{16,512}$/;

/**
 * Theme packs (plans/phase-3b). Public: the active pack's CSS, its assets and
 * signed previews. Admin (`layouts`): install, list, activate, preview links,
 * download and delete.
 */
@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  @Get('active')
  async active() {
    return { data: await this.themes.active() };
  }

  @Get('assets/:packId/:file')
  async asset(
    @Param('packId', new ParseUUIDPipe()) packId: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    if (!ASSET_FILE.test(file))
      throw new BadRequestException('Invalid file name');
    const asset = await this.themes.asset(packId, file);
    res.set({
      'Content-Type': asset.mime,
      // Each install or edit is a new pack id, so a URL's file never changes.
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    res.send(Buffer.from(asset.bytes));
  }

  @Get('preview/:token')
  async preview(@Param('token') token: string) {
    if (!PREVIEW_TOKEN.test(token))
      throw new BadRequestException('Invalid preview link');
    return { data: await this.themes.preview(token) };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Get()
  async list() {
    return { data: await this.themes.list() };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: PACK_LIMITS.zipBytes, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!/\.zip$/i.test(file.originalname)) {
          cb(
            new BadRequestException('Upload a theme pack as a .zip file.'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async install(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.themes.install(file.buffer);
    return {
      data: result,
      message: `${result.pack.name} ${result.pack.version} installed`,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Post('deactivate')
  async deactivate() {
    return {
      data: await this.themes.deactivate(),
      message: 'Built-in theme active',
    };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Post(':id/activate')
  async activate(@Param('id', new ParseUUIDPipe()) id: string) {
    return { data: await this.themes.activate(id), message: 'Theme activated' };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Post(':id/preview-token')
  async previewToken(@Param('id', new ParseUUIDPipe()) id: string) {
    return { data: await this.themes.previewToken(id) };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Get(':id/download')
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const zip = await this.themes.download(id);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zip.name}"`,
      'Cache-Control': 'no-store',
    });
    res.send(zip.bytes);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('layouts')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.themes.remove(id);
    return { message: 'Theme deleted' };
  }
}
