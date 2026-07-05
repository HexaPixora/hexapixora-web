import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@repo/database';
import { SECTIONS } from '../../auth/permissions';

const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM_MEMBER'] as Role[];

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @IsOptional()
  @IsArray()
  @IsIn(SECTIONS as readonly string[], { each: true })
  permissions?: string[];
}

// Invite flow: admin supplies everything EXCEPT a password (the invitee sets it).
export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @IsOptional()
  @IsArray()
  @IsIn(SECTIONS as readonly string[], { each: true })
  permissions?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @IsOptional()
  @IsArray()
  @IsIn(SECTIONS as readonly string[], { each: true })
  permissions?: string[];

  // Optional password reset.
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;
}
