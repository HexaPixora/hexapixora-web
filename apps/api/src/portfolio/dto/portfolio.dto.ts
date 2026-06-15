import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

class PortfolioFields {
  @IsOptional() @IsString() clientName?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() challenge?: string;
  @IsOptional() @IsString() solution?: string;
  @IsOptional() @IsString() results?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @IsOptional() @IsArray() gallery?: any[];
  @IsOptional() @IsString() @MaxLength(255) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) metaDescription?: string;
  @IsOptional() @IsString() @MaxLength(255) metaKeywords?: string;
  @IsOptional() @IsString() ogImage?: string;
}

export class CreatePortfolioDto extends PortfolioFields {
  @IsString() @MaxLength(300) title: string;
  @IsString() @MaxLength(300) slug: string;
  @IsString() description: string;
}

export class UpdatePortfolioDto extends PortfolioFields {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(300) slug?: string;
  @IsOptional() @IsString() description?: string;
}
