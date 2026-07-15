import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFiles, Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('published') published?: string,
  ) {
    return this.blogsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      category,
      published: published !== undefined ? published === 'true' : undefined,
    });
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: string) {
    return this.blogsService.findRecent(limit ? parseInt(limit) : 5);
  }

  @Get('categories')
  findCategories() {
    return this.blogsService.findCategories();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  // Posts related to :slug by shared category (falls back to recent).
  @Get('slug/:slug/related')
  findRelated(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.blogsService.findRelated(slug, limit ? parseInt(limit) : 3);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Post()
  create(@Body() body: CreateBlogDto) {
    return this.blogsService.create(body);
  }

  // Parse uploaded Markdown/.zip files for the import preview (no DB writes).
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Post('import/preview')
  @UseInterceptors(FilesInterceptor('files', 200, { limits: { fileSize: 15 * 1024 * 1024 } }))
  previewImport(@UploadedFiles() files: Array<{ originalname?: string; buffer: Buffer }>) {
    return this.blogsService.previewImport(files || []);
  }

  // Save the reviewed/edited posts from the preview.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Post('import/commit')
  commitImport(@Body() body: { posts?: any[]; overwrite?: boolean }) {
    return this.blogsService.commitImport(body?.posts || [], Boolean(body?.overwrite));
  }

  // Export posts (all, or the given ids) as a downloadable .zip of Markdown.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Post('export')
  async exportPosts(@Body('ids') ids: string[] | undefined, @Res() res: Response) {
    const { filename, buffer } = await this.blogsService.exportPosts(Array.isArray(ids) ? ids : undefined);
    res
      .set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      })
      .send(buffer);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return this.blogsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
