import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ExamStatus } from 'generated/prisma/enums';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  examTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;
}
