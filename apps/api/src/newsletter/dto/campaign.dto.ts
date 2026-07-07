import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;
}

export class TestCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEmail()
  to: string;
}

export class UnsubscribeDto {
  @IsString()
  token: string;
}
