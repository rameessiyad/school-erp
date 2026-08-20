import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from 'generated/prisma/enums';

export class ReviewLeaveDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus; // APPROVED or REJECTED

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
