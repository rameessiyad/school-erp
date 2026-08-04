import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @IsUUID()
  sectionId: string;

  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsString()
  rollNo?: string;
}
