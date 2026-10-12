import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import {
  AUTOMATION_IMAGE_TYPES,
  AutomationService,
} from './automation.service';
import { AutomationKeyGuard } from './automation-key.guard';
import { AutomationPostDto, PostImageDto } from './dto/automation-post.dto';

// Narrow, key-authenticated surface for the automation runs. It can read
// context/reports, add posts and images, and set the image on posts it created
// — it can't edit hand-written content or delete anything.
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

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        AUTOMATION_IMAGE_TYPES[file.mimetype]
          ? cb(null, true)
          : cb(
              new BadRequestException(
                `Unsupported image type: ${file.mimetype}`,
              ),
              false,
            ),
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded (field name "file")');
    }
    return this.automation.uploadImage(file);
  }

  @Patch('posts/:slug/image')
  setPostImage(@Param('slug') slug: string, @Body() body: PostImageDto) {
    return this.automation.setPostImage(slug, body.url);
  }

  @Get('report')
  report(@Query('days') days?: string) {
    const n = Math.min(Math.max(parseInt(days ?? '7', 10) || 7, 1), 90);
    return this.automation.report(n);
  }
}
