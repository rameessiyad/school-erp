import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class CreateStudentWithEnrollmentDto extends CreateStudentDto {
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rollNo?: string;
}
