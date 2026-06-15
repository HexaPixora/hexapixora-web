import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

class TestimonialFields {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateTestimonialDto extends TestimonialFields {
  @IsString() @MaxLength(200) clientName: string;
  @IsString() review: string;
}

export class UpdateTestimonialDto extends TestimonialFields {
  @IsOptional() @IsString() @MaxLength(200) clientName?: string;
  @IsOptional() @IsString() review?: string;
}
