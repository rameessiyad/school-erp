import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];

  @IsOptional()
  @IsBoolean()
  isGraduatingClass?: boolean;

  @IsOptional()
  @IsUUID()
  promotesToClassId?: string;
}
