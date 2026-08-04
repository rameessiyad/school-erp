import { IsUUID } from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  subjectId: string;

  @IsUUID()
  sectionId: string;

  @IsUUID()
  academicYearId: string;
}
