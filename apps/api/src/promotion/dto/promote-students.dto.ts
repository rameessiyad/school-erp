import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class SectionMappingDto {
  @IsUUID()
  fromSectionId: string;

  @IsUUID()
  toSectionId: string;
}

export class PromoteStudentsDto {
  @IsUUID()
  fromAcademicYearId: string;

  @IsUUID()
  toAcademicYearId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionMappingDto)
  sectionMappings: SectionMappingDto[];
}
