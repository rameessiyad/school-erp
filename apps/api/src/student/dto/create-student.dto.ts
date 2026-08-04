import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from 'generated/prisma/enums';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  admissionNo: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsDateString()
  admissionDate?: string;
}
