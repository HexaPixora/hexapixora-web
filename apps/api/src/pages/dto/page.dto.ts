import { Allow, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

class PageFields {
  // sections is free-form JSON (array of module configs from the builder, or a
  // serialized string from quick-create) — accepted as-is.
  @IsOptional() @Allow() sections?: any;
  @IsOptional() @IsBoolean() showHeader?: boolean;
  @IsOptional() @IsBoolean() showFooter?: boolean;
  @IsOptional() @IsString() @MaxLength(255) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) metaDescription?: string;
}

export class CreatePageDto extends PageFields {
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(300) slug: string;
}

export class UpdatePageDto extends PageFields {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(300) slug?: string;
}
