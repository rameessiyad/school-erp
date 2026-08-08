import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(schoolId: string) {
    const [studentCount, teacherCount, parentCount, feePayments] =
      await Promise.all([
        this.prisma.student.count({
          where: { schoolId, isActive: true },
        }),
        this.prisma.teacher.count({ where: { schoolId, isActive: true } }),
        this.prisma.parent.count({ where: { schoolId } }),
        this.prisma.feePayment.findMany({
          where: { studentFee: { student: { schoolId } } },
          select: { amount: true },
        }),
      ]);

    const totalFeesCollected = feePayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      studentCount,
      teacherCount,
      parentCount,
      totalFeesCollected,
    };
  }
}
