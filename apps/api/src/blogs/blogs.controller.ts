import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
  UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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

  // Bulk import from Markdown files (or a .zip bundle of them).
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('blogs')
  @Post('import')
  @UseInterceptors(FilesInterceptor('files', 200, { limits: { fileSize: 15 * 1024 * 1024 } }))
  importFiles(
    @UploadedFiles() files: Array<{ originalname?: string; buffer: Buffer }>,
    @Body('overwrite') overwrite?: string,
    @Body('publish') publish?: string,
  ) {
    return this.blogsService.importFiles(files || [], {
      overwrite: overwrite === 'true' || overwrite === '1',
      publish: publish === 'true' || publish === '1',
    });
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
