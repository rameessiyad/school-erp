import { IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { FeeStatus } from 'generated/prisma/enums';

export class QueryStudentFeeDto {
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsEnum(FeeStatus)
  status?: FeeStatus;

  @IsOptional()
  @IsString()
  search?: string; // matches student name / admission number
}
