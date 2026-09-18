import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getMonthAbbr(date: Date): string {
  return MONTH_ABBR[date.getMonth()];
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(schoolId: string, academicYearId?: string) {
    const requestedYear = academicYearId
      ? await this.prisma.academicYear.findFirst({
          where: { id: academicYearId, schoolId },
          select: { id: true, label: true, isActive: true },
        })
      : await this.prisma.academicYear.findFirst({
          where: { schoolId, isActive: true },
          select: { id: true, label: true, isActive: true },
        });

    const academicYear = requestedYear
      ? { id: requestedYear.id, label: requestedYear.label }
      : null;
    const resolvedAcademicYearId = requestedYear?.id;
    const isViewingActiveYear = requestedYear?.isActive ?? false;

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

      resolvedAcademicYearId
        ? this.prisma.section
            .findMany({
              where: {
                schoolId,
                academicYearId: resolvedAcademicYearId,
              },
              select: {
                classId: true,
              },
              distinct: ['classId'],
            })
            .then((sections) => sections.length)
        : 0,

      resolvedAcademicYearId
        ? this.prisma.studentFee.findMany({
            where: {
              student: {
                schoolId,
              },
              feeStructure: {
                academicYearId: resolvedAcademicYearId,
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
            ...(resolvedAcademicYearId
              ? {
                  feeStructure: {
                    academicYearId: resolvedAcademicYearId,
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

        const month = getMonthAbbr(payment.paymentDate); // fixed: was locale-dependent 'Sept' vs 'Sep' mismatch

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
    // Student attendance trend (last 14 days, % present)
    // Only meaningful for the currently active academic year —
    // a past year has no "last 14 days" to speak of.
    // ---------------------------------------------------------

    const attendanceDays = 14;
    let attendanceTrend: { date: string; percentage: number | null }[] = [];

    if (isViewingActiveYear) {
      const attendanceFrom = new Date();
      attendanceFrom.setDate(attendanceFrom.getDate() - (attendanceDays - 1));
      attendanceFrom.setHours(0, 0, 0, 0);

      const attendanceRecords = await this.prisma.studentAttendance.findMany({
        where: {
          schoolId,
          date: { gte: attendanceFrom },
        },
        select: { date: true, status: true },
      });

      const attendanceByDay = new Map<
        string,
        { present: number; total: number }
      >();

      for (const record of attendanceRecords) {
        const key = record.date.toISOString().slice(0, 10);
        const entry = attendanceByDay.get(key) ?? { present: 0, total: 0 };
        entry.total += 1;
        if (record.status === 'PRESENT') entry.present += 1;
        attendanceByDay.set(key, entry);
      }

      attendanceTrend = Array.from({ length: attendanceDays }).map((_, i) => {
        const day = new Date(attendanceFrom);
        day.setDate(day.getDate() + i);
        const key = day.toISOString().slice(0, 10);
        const entry = attendanceByDay.get(key);

        return {
          date: day.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          }),
          percentage:
            entry && entry.total > 0
              ? Math.round((entry.present / entry.total) * 100)
              : null,
        };
      });
    }

    // ---------------------------------------------------------
    // Student distribution
    // ---------------------------------------------------------

    let studentDistribution: {
      className: string;
      count: number;
    }[] = [];

    if (resolvedAcademicYearId) {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          schoolId,
          academicYearId: resolvedAcademicYearId,
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
      attendanceTrend,
      studentDistribution,

      recentActivities,
      upcomingItems,

      academicYear,
    };
  }
}
