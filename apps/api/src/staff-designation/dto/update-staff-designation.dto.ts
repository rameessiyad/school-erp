import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDesignationDto } from './create-staff-designation.dto';

export class UpdateStaffDesignationDto extends PartialType(
  CreateStaffDesignationDto,
) {}
