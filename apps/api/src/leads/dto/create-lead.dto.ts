import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @IsOptional()
  @IsIn(['contact', 'consultation', 'quote', 'download'])
  type?: string;

  // Honeypot. A hidden field real users never see or fill — if it arrives
  // populated the submission is from a bot. Declared here so the global
  // whitelist ValidationPipe doesn't strip it before the service can check it.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
