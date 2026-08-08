import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { FeeFrequency } from 'generated/prisma/enums';

export class CreateFeeStructureDto {
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  name: string; // e.g. "Tuition Fee - Term 1", "Admission Fee"

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(FeeFrequency)
  frequency: FeeFrequency;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  description?: string;
}
