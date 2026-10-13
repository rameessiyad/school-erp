import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Module } from 'src/common/permissions/module.enum';

export class CreateSchoolAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i, {
    message:
      'Subdomain can only contain letters, numbers and hyphens (not at the start or end)',
  })
  subdomain: string;

  // If omitted, the school gets ALL modules
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Module, { each: true })
  allowedModules?: Module[];

  @ValidateNested()
  @Type(() => CreateSchoolAdminDto)
  admin: CreateSchoolAdminDto;
}
