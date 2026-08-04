import { IsUUID } from 'class-validator';

export class AssignClassTeacherDto {
  @IsUUID()
  teacherId: string;

  @IsUUID()
  academicYearId: string;
}
