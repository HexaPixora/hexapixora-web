import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Public site search across published blogs + pages.
  @Get()
  search(@Query('q') q?: string, @Query('limit') limit?: string) {
    const n = Math.min(Math.max(parseInt(limit ?? '8', 10) || 8, 1), 25);
    return this.searchService.search(q ?? '', n);
  }
}
