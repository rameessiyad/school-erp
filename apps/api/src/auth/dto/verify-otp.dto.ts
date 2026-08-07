import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyOtpDto {
  @IsUUID()
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
