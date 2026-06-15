import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/** Body for reorder endpoints: an ordered list of entity ids. */
export class ReorderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
