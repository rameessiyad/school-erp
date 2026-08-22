import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StudentAttendanceStatus } from 'generated/prisma/enums';

class StudentAttendanceEntryDto {
  @IsString()
  studentId: string;

  @IsEnum(StudentAttendanceStatus)
  status: StudentAttendanceStatus;
}

export class MarkAttendanceDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceEntryDto)
  entries: StudentAttendanceEntryDto[];
}
