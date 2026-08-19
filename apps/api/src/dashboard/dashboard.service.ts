import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(schoolId: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: {
        schoolId,
        isActive: true,
      },
      select: {
        id: true,
        label: true,
      },
    });

    const academicYearId = academicYear?.id;

    const [
      studentCount,
      teacherCount,
      classCount,
      studentFees,
      recentStudents,
      recentTeachers,
      recentPayments,
    ] = await Promise.all([
      this.prisma.student.count({
        where: {
          schoolId,
          isActive: true,
        },
      }),

      this.prisma.teacher.count({
        where: {
          schoolId,
          isActive: true,
        },
      }),

      academicYearId
        ? this.prisma.section
            .findMany({
              where: {
                schoolId,
                academicYearId,
              },
              select: {
                classId: true,
              },
              distinct: ['classId'],
            })
            .then((sections) => sections.length)
        : 0,

      academicYearId
        ? this.prisma.studentFee.findMany({
            where: {
              student: {
                schoolId,
              },
              feeStructure: {
                academicYearId,
              },
            },
            select: {
              id: true,
              totalAmount: true,
              discountAmount: true,
              dueDate: true,
              status: true,
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              feeStructure: {
                select: {
                  name: true,
                },
              },
              payments: {
                select: {
                  amount: true,
                  paymentDate: true,
                },
              },
            },
          })
        : [],

      this.prisma.student.findMany({
        where: {
          schoolId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),

      this.prisma.teacher.findMany({
        where: {
          schoolId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),

      this.prisma.feePayment.findMany({
        where: {
          studentFee: {
            student: {
              schoolId,
            },
            ...(academicYearId
              ? {
                  feeStructure: {
                    academicYearId,
                  },
                }
              : {}),
          },
        },
        orderBy: {
          paymentDate: 'desc',
        },
        take: 5,
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          studentFee: {
            select: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // ---------------------------------------------------------
    // Fee calculations
    // ---------------------------------------------------------

    let totalFeesCollected = 0;
    let totalFeesPending = 0;

    const feeTrendMap = new Map<string, number>();

    for (const studentFee of studentFees) {
      const payableAmount = Math.max(
        Number(studentFee.totalAmount) - Number(studentFee.discountAmount),
        0,
      );

      let paidAmount = 0;

      for (const payment of studentFee.payments) {
        const amount = Number(payment.amount);

        paidAmount += amount;
        totalFeesCollected += amount;

        const month = payment.paymentDate.toLocaleDateString('en-IN', {
          month: 'short',
        });

        feeTrendMap.set(month, (feeTrendMap.get(month) ?? 0) + amount);
      }

      totalFeesPending += Math.max(payableAmount - paidAmount, 0);
    }

    const totalFeesExpected = totalFeesCollected + totalFeesPending;

    const feeCollectionPercentage =
      totalFeesExpected > 0
        ? Math.round((totalFeesCollected / totalFeesExpected) * 100)
        : 0;

    // ---------------------------------------------------------
    // Fee trend
    // ---------------------------------------------------------

    const monthOrder = [
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
    ];

    const feeTrend = monthOrder.map((month) => ({
      month,
      collected: feeTrendMap.get(month) ?? 0,
    }));

    // ---------------------------------------------------------
    // Student distribution
    // ---------------------------------------------------------

    let studentDistribution: {
      className: string;
      count: number;
    }[] = [];

    if (academicYearId) {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          schoolId,
          academicYearId,
          student: {
            isActive: true,
          },
        },
        select: {
          section: {
            select: {
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const classMap = new Map<
        string,
        {
          className: string;
          count: number;
        }
      >();

      for (const enrollment of enrollments) {
        const classData = enrollment.section.class;

        const existing = classMap.get(classData.id);

        if (existing) {
          existing.count += 1;
        } else {
          classMap.set(classData.id, {
            className: classData.name,
            count: 1,
          });
        }
      }

      studentDistribution = Array.from(classMap.values()).sort((a, b) => {
        return a.className.localeCompare(b.className, undefined, {
          numeric: true,
        });
      });
    }

    // ---------------------------------------------------------
    // Recent activities
    // ---------------------------------------------------------

    const activities = [
      ...recentStudents.map((student) => ({
        id: `student-${student.id}`,
        type: 'student' as const,
        title: 'New student added',
        description: `${student.firstName} ${student.lastName ?? ''}`.trim(),
        createdAt: student.createdAt.toISOString(),
      })),

      ...recentTeachers.map((teacher) => ({
        id: `teacher-${teacher.id}`,
        type: 'teacher' as const,
        title: 'New teacher added',
        description: `${teacher.firstName} ${teacher.lastName ?? ''}`.trim(),
        createdAt: teacher.createdAt.toISOString(),
      })),

      ...recentPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: 'fee' as const,
        title: 'Fee payment received',
        description: `₹${Number(payment.amount).toLocaleString('en-IN')} · ${
          payment.studentFee.student.firstName
        } ${payment.studentFee.student.lastName ?? ''}`.trim(),
        createdAt: payment.paymentDate.toISOString(),
      })),
    ];

    const recentActivities = activities
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6);

    // ---------------------------------------------------------
    // Upcoming fee dues
    // ---------------------------------------------------------

    const now = new Date();

    const upcomingItems = studentFees
      .filter((fee) => fee.dueDate && new Date(fee.dueDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
      )
      .slice(0, 5)
      .map((fee) => ({
        id: fee.id,
        title: fee.feeStructure.name,
        description: `${fee.student.firstName} ${
          fee.student.lastName ?? ''
        }`.trim(),
        date: fee.dueDate!.toISOString(),
      }));

    return {
      studentCount,
      teacherCount,
      classCount,

      totalFeesCollected,
      totalFeesPending,
      feeCollectionPercentage,

      feeTrend,
      studentDistribution,

      recentActivities,
      upcomingItems,

      academicYear,
    };
  }
}
