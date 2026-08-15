import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { Module } from 'src/common/permissions/module.enum';
import { FeePaymentService } from './fee-payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@Controller('fee-payments')
export class FeePaymentController {
  constructor(private readonly feePaymentService: FeePaymentService) {}

  @Post()
  @RequireModule(Module.STUDENT_FEES)
  create(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.feePaymentService.create(
      req.user.schoolId,
      dto,
      req.user.userId,
    );
  }

  @Get('student-fee/:studentFeeId')
  @RequireModule(Module.PAYMENT_HISTORY)
  findByStudentFee(
    @Req() req: any,
    @Param('studentFeeId') studentFeeId: string,
  ) {
    return this.feePaymentService.findByStudentFee(
      req.user.schoolId,
      studentFeeId,
    );
  }

  @Get(':id')
  @RequireModule(Module.PAYMENT_HISTORY)
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.feePaymentService.findOne(req.user.schoolId, id);
  }
}
