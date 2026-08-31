import {
  IsEmail,
  IsNotEmpty,
  IsString,
  // IsUUID,
  MinLength,
} from 'class-validator';

export class loginDto {
  // @IsUUID()
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
