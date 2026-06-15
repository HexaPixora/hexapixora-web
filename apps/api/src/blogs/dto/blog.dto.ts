import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// SEO fields shared by several content types.
class SeoFields {
  @IsOptional() @IsString() @MaxLength(255) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) metaDescription?: string;
  @IsOptional() @IsString() @MaxLength(255) metaKeywords?: string;
  @IsOptional() @IsString() ogImage?: string;
}

export class CreateBlogDto extends SeoFields {
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(300) slug: string;
  @IsString() content: string;

  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() publishDate?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateBlogDto extends SeoFields {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(300) slug?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() publishDate?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
