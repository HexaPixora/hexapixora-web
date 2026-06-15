import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { sanitizeSvg } from './svg-sanitizer';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Only allow image/video/document types we actually render. This blocks
// uploads of active content (.html, executables) that could be served back
// from our own origin. SVG is allowed but sanitized after upload (see
// uploadFile), since a raw SVG can carry scripts/event handlers.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('media')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tmpPath = path.join(UPLOAD_DIR, basename(file.filename));

    // SVGs can carry scripts/event handlers, so the version multer wrote to
    // disk is untrusted. Sanitize it in place before it can ever be served.
    if (file.mimetype === 'image/svg+xml') {
      const sanitized = sanitizeSvg(fs.readFileSync(tmpPath, 'utf8'));
      if (!sanitized) {
        fs.unlinkSync(tmpPath);
        throw new BadRequestException('Invalid or unsafe SVG file');
      }
      fs.writeFileSync(tmpPath, sanitized, 'utf8');
    }

    // Deduplicate by content: name the stored file after the sha256 of its
    // (post-sanitization) bytes. Re-uploading the same asset then resolves to
    // the same filename, so we can detect and reuse the existing record
    // instead of piling up duplicates in the library.
    const buffer = fs.readFileSync(tmpPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = extname(file.filename);
    const finalName = `${hash}${ext}`;

    const existing = await this.mediaService.findByFilename(finalName);
    if (existing) {
      fs.unlinkSync(tmpPath); // discard the duplicate upload
      return { ...existing, deduped: true };
    }

    fs.renameSync(tmpPath, path.join(UPLOAD_DIR, finalName));
    const created = await this.mediaService.create({
      filename: finalName,
      url: `/api/media/file/${finalName}`,
      mimetype: file.mimetype,
      size: buffer.length,
    });
    return { ...created, deduped: false };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('media')
  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('media')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const item = await this.mediaService.findOne(id);
    if (!item) {
      throw new NotFoundException('Media not found');
    }
    // basename() neutralizes any path segments stored on the record.
    const filePath = path.join(UPLOAD_DIR, basename(item.filename));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return this.mediaService.delete(id);
  }

  // Publicly accessible media files.
  @Get('file/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // Reject any attempt at path traversal: the param must be a bare filename.
    const safeName = basename(filename);
    if (safeName !== filename) {
      throw new BadRequestException('Invalid filename');
    }
    const filePath = path.join(UPLOAD_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    // Defense-in-depth: even though SVGs are sanitized on upload, a restrictive
    // CSP ensures no script can execute if one is opened directly.
    if (extname(safeName).toLowerCase() === '.svg') {
      res.setHeader('Content-Security-Policy', "script-src 'none'; object-src 'none'");
    }
    res.sendFile(safeName, { root: UPLOAD_DIR });
  }
}
