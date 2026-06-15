import { IsInt, IsOptional, IsString, Min } from 'class-validator';

class FaqFields {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateFaqDto extends FaqFields {
  @IsString() question: string;
  @IsString() answer: string;
}

export class UpdateFaqDto extends FaqFields {
  @IsOptional() @IsString() question?: string;
  @IsOptional() @IsString() answer?: string;
}
