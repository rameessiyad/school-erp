import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from 'generated/prisma/enums';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  studentFeeId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  remarks?: string;
}
