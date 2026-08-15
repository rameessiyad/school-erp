import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma/enums';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  studentFeeId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  remarks?: string;
}
