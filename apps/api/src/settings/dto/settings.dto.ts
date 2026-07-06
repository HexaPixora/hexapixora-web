import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BookingLinkDto {
  @IsString() @MinLength(1) @MaxLength(80) label: string;
  // Scheduling URL (e.g. a Calendly event-type link).
  @IsUrl({ require_protocol: true }) @MaxLength(500) url: string;
}

// Single-row site configuration. All fields optional — the service merges into
// the existing "global" row. Server-managed fields (id, timestamps) are
// stripped by the global ValidationPipe whitelist.
export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(200) siteName?: string;
  @IsOptional() @IsString() @MaxLength(300) tagline?: string;
  @IsOptional() @IsString() businessEmail?: string;
  @IsOptional() @IsString() businessPhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() googleMapsUrl?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() faviconUrl?: string;

  // SEO / social-share defaults.
  @IsOptional() @IsString() @MaxLength(300) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) seoDescription?: string;
  @IsOptional() @IsString() @MaxLength(500) seoKeywords?: string;
  @IsOptional() @IsString() @MaxLength(1000) ogImage?: string;

  @IsOptional() @IsString() googleAnalyticsId?: string;
  @IsOptional() @IsString() gtmId?: string;
  @IsOptional() @IsString() metaPixelId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingLinkDto)
  bookingLinks?: BookingLinkDto[];
}
