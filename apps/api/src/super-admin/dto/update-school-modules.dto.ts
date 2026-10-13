import { ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { Module } from 'src/common/permissions/module.enum';

export class UpdateSchoolModulesDto {
  @IsArray()
  @ArrayUnique()
  @IsEnum(Module, { each: true })
  allowedModules: Module[];
}
