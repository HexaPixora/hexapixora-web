import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

class TeamFields {
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class CreateTeamMemberDto extends TeamFields {
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(200) designation: string;
}

export class UpdateTeamMemberDto extends TeamFields {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(200) designation?: string;
}
