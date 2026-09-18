import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Module } from 'src/common/permissions/module.enum';

export class CreateStaffDesignationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Module, { each: true })
  allowedModules?: Module[];
}