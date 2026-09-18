import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfterStartDate', async: false })
class IsAfterStartDateConstraint implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const obj = args.object as CreateAcademicYearDto;
    if (!obj.startDate || !endDate) return true; // let @IsNotEmpty handle missing fields
    return new Date(endDate).getTime() > new Date(obj.startDate).getTime();
  }

  defaultMessage() {
    return 'endDate must be after startDate';
  }
}

export class CreateAcademicYearDto {
  @IsNotEmpty()
  @IsString()
  label: string; // e.g. "2026-2027"

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @Validate(IsAfterStartDateConstraint)
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
