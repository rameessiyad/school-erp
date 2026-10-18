import {
  AnnouncementAudience,
  AnnouncementCategory,
} from '../../../generated/prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// presets shown in the UI: 1 day, 3 days, 1 week, 2 weeks, 1 month
export const EXPIRY_DAYS = [1, 3, 7, 14, 30] as const;

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(5000)
  content: string;

  @IsEnum(AnnouncementCategory)
  category: AnnouncementCategory;

  @IsEnum(AnnouncementAudience)
  @IsOptional()
  audience?: AnnouncementAudience;

  @IsInt()
  @IsIn(EXPIRY_DAYS as unknown as number[])
  expiryDays: number;
}

// on update, expiryDays (if sent) is counted from NOW, so admins can extend an announcement
export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {}

export class QueryAnnouncementDto {
  @IsEnum(AnnouncementCategory)
  @IsOptional()
  category?: AnnouncementCategory;
}
