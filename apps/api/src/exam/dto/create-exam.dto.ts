import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ExamType, ExamStatus } from 'generated/prisma/enums';

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  name: string; // e.g. "Onam Exam", "Term 1 Exam"

  @IsEnum(ExamType)
  examType: ExamType; // MODEL | TERM

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus; // defaults to DRAFT if omitted
}
