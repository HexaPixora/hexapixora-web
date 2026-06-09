import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

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

  @Post()
  async create(@Body() createPageDto: any) {
    const page = await this.pagesService.create(createPageDto);
    return { data: page, message: 'Page created successfully' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePageDto: any) {
    const page = await this.pagesService.update(id, updatePageDto);
    return { data: page, message: 'Page updated successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pagesService.remove(id);
    return { message: 'Page deleted successfully' };
  }
}
