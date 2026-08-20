import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TeacherAttendanceStatus } from 'generated/prisma/enums';

export class MarkAttendanceDto {
  @IsEnum(TeacherAttendanceStatus)
  status: TeacherAttendanceStatus;

  @IsOptional()
  @IsDateString()
  date?: string; // defaults to today if omitted
}
