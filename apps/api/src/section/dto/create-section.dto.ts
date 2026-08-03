import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsString()
  name: string; // e.g. "A"

  @IsUUID()
  classId: string;

  @IsUUID()
  academicYearId: string;
}
