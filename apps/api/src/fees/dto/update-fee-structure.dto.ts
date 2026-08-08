import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFeeStructureDto } from './create-fee-structure.dto';

export class UpdateFeeStructureDto extends PartialType(
  OmitType(CreateFeeStructureDto, ['academicYearId', 'classId'] as const),
) {}
