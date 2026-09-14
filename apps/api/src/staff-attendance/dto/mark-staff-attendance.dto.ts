import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TeacherAttendanceStatus } from 'generated/prisma/enums';

export class MarkStaffAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsEnum(TeacherAttendanceStatus)
  status: TeacherAttendanceStatus;
}
