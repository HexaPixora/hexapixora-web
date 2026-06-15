import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

class ServiceFields {
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() banner?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsArray() features?: any[];
  @IsOptional() @IsArray() faq?: any[];
  @IsOptional() @IsString() @MaxLength(255) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) metaDescription?: string;
  @IsOptional() @IsString() @MaxLength(255) metaKeywords?: string;
  @IsOptional() @IsString() ogImage?: string;
}

export class CreateServiceDto extends ServiceFields {
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(300) slug: string;
  @IsString() content: string;
}

export class UpdateServiceDto extends ServiceFields {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(300) slug?: string;
  @IsOptional() @IsString() content?: string;
}
