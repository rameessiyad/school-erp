import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ParentRelationship } from 'generated/prisma/enums';

export class CreateParentDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsUUID()
  studentId: string;

  @IsEnum(ParentRelationship)
  relationship: ParentRelationship;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
