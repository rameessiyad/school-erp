import {
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentAttendanceStatus } from 'generated/prisma/enums';

export class StudentAttendanceRecordDto {
  @IsString()
  studentId: string;

  @IsEnum(StudentAttendanceStatus)
  status: StudentAttendanceStatus;
}

export class MarkStudentAttendanceDto {
  @IsString()
  sectionId: string;

  @IsDateString()
  date: string; // YYYY-MM-DD

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceRecordDto)
  records: StudentAttendanceRecordDto[];
}
