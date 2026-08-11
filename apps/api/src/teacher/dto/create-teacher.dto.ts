import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

import { Gender } from 'generated/prisma/enums';

class TeacherAllocationDto {
  @IsUUID()
  subjectId: string;

  @IsUUID()
  sectionId: string;

  @IsUUID()
  academicYearId: string;
}

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  )
  @IsInt()
  experience?: number;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  // parse the JSON string AND build real DTO instances in one step —
  // don't rely on @Type here, it's what was dropping the fields
  @IsOptional()
  @Transform(({ value }) => {
    let parsed = value;

    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return value;
      }
    }

    if (!Array.isArray(parsed)) return parsed;

    return parsed.map((item) => plainToInstance(TeacherAllocationDto, item));
  })
  @IsArray()
  @ValidateNested({ each: true })
  allocations?: TeacherAllocationDto[];
}
