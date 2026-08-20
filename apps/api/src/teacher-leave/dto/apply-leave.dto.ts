import { IsDateString, IsString, MinLength } from 'class-validator';

export class ApplyLeaveDto {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  @MinLength(3)
  reason: string;
}
