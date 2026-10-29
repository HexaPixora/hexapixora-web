import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * A theme saved from the editor as a new pack version. The tokens are checked
 * value by value with the theme pack schema in the service.
 */
export class SaveThemeVersionDto {
  /** The pack it was edited from; omitted when starting from the built-in theme. */
  @IsOptional()
  @IsUUID()
  baseId?: string;

  @IsString()
  @MaxLength(60)
  name!: string;

  @IsString()
  @MaxLength(40)
  slug!: string;

  @IsString()
  @MaxLength(20)
  version!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsObject()
  tokens!: Record<string, unknown>;
}
