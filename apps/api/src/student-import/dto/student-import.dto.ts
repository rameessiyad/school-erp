import { IsOptional, IsUUID } from 'class-validator';

export class ImportTargetDto {
  @IsUUID()
  academicYearId: string;

  // omitted when the workbook contains multiple classes
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}
