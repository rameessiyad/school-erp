import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SchoolStatus } from 'generated/prisma/enums';

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i, {
    message:
      'Subdomain can only contain letters, numbers and hyphens (not at the start or end)',
  })
  subdomain?: string;

  @IsOptional()
  @IsEnum(SchoolStatus)
  status?: SchoolStatus;
}
