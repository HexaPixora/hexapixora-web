import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // Admin — full list including drafts/scheduled. Declared before the public
  // ":idOrSlug" route so "admin" isn't swallowed as a slug.
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Get('admin/list')
  async findAllAdmin() {
    const pages = await this.pagesService.findAllAdmin();
    return { data: pages };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    const page = await this.pagesService.findOneAdmin(id);
    return { data: page };
  }

  // Public — the page designated as the site home (rendered at "/"). Declared
  // before ":idOrSlug" so "homepage" isn't swallowed as a slug.
  @Get('homepage')
  async findHomepage() {
    const page = await this.pagesService.findHomepage();
    return { data: page };
  }

  // Public — the live site renders pages by slug. Only published pages are returned.
  @Get()
  async findAll() {
    const pages = await this.pagesService.findAll();
    return { data: pages };
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const page = await this.pagesService.findOne(idOrSlug);
    return { data: page };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Post()
  async create(@Body() createPageDto: CreatePageDto) {
    const page = await this.pagesService.create(createPageDto);
    return { data: page, message: 'Page created successfully' };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    const page = await this.pagesService.update(id, updatePageDto);
    return { data: page, message: 'Page updated successfully' };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Patch(':id/homepage')
  async setHomepage(@Param('id') id: string) {
    const result = await this.pagesService.setHomepage(id);
    return { data: result, message: 'Homepage updated successfully' };
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pages')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pagesService.remove(id);
    return { message: 'Page deleted successfully' };
  }
}
