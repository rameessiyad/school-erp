import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FeeStatus } from 'generated/prisma/enums';
import { randomUUID } from 'crypto';

@Injectable()
export class FeePaymentService {
  constructor(private prisma: PrismaService) {}

  private generateReceiptNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = randomUUID().slice(0, 6).toUpperCase();
    return `RCPT-${datePart}-${randomPart}`;
  }

  async create(schoolId: string, dto: CreatePaymentDto, collectedById: string) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, feeStructure: { schoolId } },
      include: { payments: { select: { amount: true } } },
    });

    if (!studentFee)
      throw new NotFoundException('Student fee record not found');

    const payable =
      Number(studentFee.totalAmount) - Number(studentFee.discountAmount);
    const alreadyPaid = studentFee.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remaining = payable - alreadyPaid;

    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance of ${remaining}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // retry loop guards against the extremely unlikely receiptNumber collision
      let payment;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          payment = await tx.feePayment.create({
            data: {
              studentFeeId: dto.studentFeeId,
              amount: dto.amount,
              paymentMethod: dto.paymentMethod,
              receiptNumber: this.generateReceiptNumber(),
              collectedById,
              remarks: dto.remarks,
            },
          });
          break;
        } catch (err: any) {
          if (err.code === 'P2002' && attempt < 2) continue;
          throw err;
        }
      }

      const newTotalPaid = alreadyPaid + dto.amount;
      const newStatus =
        newTotalPaid >= payable ? FeeStatus.PAID : FeeStatus.PARTIALLY_PAID;

      await tx.studentFee.update({
        where: { id: dto.studentFeeId },
        data: { status: newStatus },
      });

      return payment;
    });
  }

  async findByStudentFee(schoolId: string, studentFeeId: string) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id: studentFeeId, feeStructure: { schoolId } },
    });
    if (!studentFee)
      throw new NotFoundException('Student fee record not found');

    return this.prisma.feePayment.findMany({
      where: { studentFeeId },
      include: { collectedBy: { select: { id: true, email: true } } },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const studentFee = await this.prisma.studentFee.findFirst({
      where: { id, feeStructure: { schoolId } },
      include: {
        student: true,
        feeStructure: { include: { class: true, academicYear: true } },
        payments: {
          include: { collectedBy: { select: { id: true, email: true } } },
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!studentFee)
      throw new NotFoundException('Student fee record not found');

    return studentFee;
  }
}
