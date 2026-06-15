import { IsOptional, IsString, MaxLength } from 'class-validator';

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
  @IsOptional() @IsString() googleAnalyticsId?: string;
  @IsOptional() @IsString() gtmId?: string;
  @IsOptional() @IsString() metaPixelId?: string;
}
