import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RequestOtpDto {
  @IsUUID()
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
