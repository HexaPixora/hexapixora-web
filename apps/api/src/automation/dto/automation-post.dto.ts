import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FaqItemDto } from '../../blogs/dto/blog.dto';

// A post written by a scheduled routine. Body is Markdown (rendered server-side
// with raw HTML disabled), so generated content can't inject markup.
export class AutomationPostDto {
  @IsString() @MinLength(10) @MaxLength(200) title: string;

  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug: string;

  @IsString() @MinLength(1500) @MaxLength(60_000) markdown: string;

  @IsString() @MaxLength(320) excerpt: string;

  // Existing category names or slugs; unknown ones are ignored (no taxonomy sprawl).
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  categories?: string[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
  @IsOptional() @IsString() thumbnail?: string;

  @IsString() @MaxLength(70) metaTitle: string;
  @IsString() @MaxLength(170) metaDescription: string;
  @IsOptional() @IsString() @MaxLength(255) metaKeywords?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faq?: FaqItemDto[];

  // Future time → SCHEDULED (the blogs cron publishes it); omitted → published now.
  @IsOptional() @IsDateString() publishAt?: string;
}
