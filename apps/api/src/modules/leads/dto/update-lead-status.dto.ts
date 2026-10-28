import { IsIn } from 'class-validator';

export class UpdateLeadStatusDto {
  @IsIn(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'])
  status: string;
}
