import { IsDateString, IsString, MinLength } from 'class-validator';

export class ApplyStaffLeaveDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  @MinLength(3)
  reason: string;
}
