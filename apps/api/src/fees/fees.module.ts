import { Module } from '@nestjs/common';
import { FeeStructureController } from './fees.controller';
import { FeeStructureService } from './fees.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentFeeController } from './student-fee.controller';
import { FeePaymentController } from './fee-payment.controller';
import { StudentFeeService } from './student-fee.service';
import { FeePaymentService } from './fee-payment.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    FeeStructureController,
    StudentFeeController,
    FeePaymentController,
  ],
  providers: [FeeStructureService, StudentFeeService, FeePaymentService],
})
export class FeesModule {}
