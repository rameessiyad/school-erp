import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateExamTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
