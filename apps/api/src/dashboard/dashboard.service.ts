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
          select: {
            id: true,
            label: true,
            isActive: true,
            startDate: true,
            endDate: true,
          },
        })
      : await this.prisma.academicYear.findFirst({
          where: { schoolId, isActive: true },
          select: {
            id: true,
            label: true,
            isActive: true,
            startDate: true,
            endDate: true,
          },
        });

    const academicYear = requestedYear
      ? { id: requestedYear.id, label: requestedYear.label }
      : null;
    const resolvedAcademicYearId = requestedYear?.id;

    const [
      studentCount,
      teacherCount,
      classCount,
      sectionCount,
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
        ? this.prisma.section.count({
            where: {
              schoolId,
              academicYearId: resolvedAcademicYearId,
            },
          })
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
    // Student attendance trend (monthly avg % present, for the
    // selected academic year — Apr to Mar, matching feeTrend)
    // ---------------------------------------------------------

    let attendanceTrend: { month: string; percentage: number | null }[] =
      monthOrder.map((month) => ({ month, percentage: null }));

    if (resolvedAcademicYearId && requestedYear?.startDate) {
      const yearStart = requestedYear.startDate;
      const yearEnd = requestedYear.endDate ?? new Date();

      const attendanceRecords = await this.prisma.studentAttendance.findMany({
        where: {
          schoolId,
          date: { gte: yearStart, lte: yearEnd },
        },
        select: { date: true, status: true },
      });

      const attendanceByMonth = new Map<
        string,
        { present: number; total: number }
      >();

      for (const record of attendanceRecords) {
        const key = getMonthAbbr(record.date);
        const entry = attendanceByMonth.get(key) ?? { present: 0, total: 0 };
        entry.total += 1;
        if (record.status === 'PRESENT') entry.present += 1;
        attendanceByMonth.set(key, entry);
      }

      attendanceTrend = monthOrder.map((month) => {
        const entry = attendanceByMonth.get(month);
        return {
          month,
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
    // Upcoming fee dues — grouped by fee type + due date,
    // not one row per student.
    // ---------------------------------------------------------

    const now = new Date();

    const upcomingFeeMap = new Map<
      string,
      { title: string; date: Date; studentCount: number; pendingAmount: number }
    >();

    for (const fee of studentFees) {
      if (!fee.dueDate || new Date(fee.dueDate) < now) continue;

      const payableAmount = Math.max(
        Number(fee.totalAmount) - Number(fee.discountAmount),
        0,
      );
      const paidAmount = fee.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const pending = Math.max(payableAmount - paidAmount, 0);

      if (pending <= 0) continue; // fully paid — nothing left to show as "due"

      const key = `${fee.feeStructure.name}|${fee.dueDate.toISOString()}`;
      const existing = upcomingFeeMap.get(key);

      if (existing) {
        existing.studentCount += 1;
        existing.pendingAmount += pending;
      } else {
        upcomingFeeMap.set(key, {
          title: fee.feeStructure.name,
          date: new Date(fee.dueDate),
          studentCount: 1,
          pendingAmount: pending,
        });
      }
    }

    const upcomingFees = Array.from(upcomingFeeMap.entries())
      .map(([key, value]) => ({
        id: key,
        title: value.title,
        studentCount: value.studentCount,
        pendingAmount: value.pendingAmount,
        date: value.date.toISOString(),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    // ---------------------------------------------------------
    // Upcoming examinations
    // ---------------------------------------------------------

    const upcomingExams = resolvedAcademicYearId
      ? (
          await this.prisma.exam.findMany({
            where: {
              academicYearId: resolvedAcademicYearId,
              startDate: { gte: now },
            },
            orderBy: { startDate: 'asc' },
            take: 5,
            select: {
              id: true,
              name: true,
              startDate: true,
              examType: { select: { name: true } },
            },
          })
        ).map((exam) => ({
          id: exam.id,
          title: exam.name,
          examTypeName: exam.examType.name,
          date: exam.startDate.toISOString(),
        }))
      : [];

    return {
      studentCount,
      teacherCount,
      classCount,
      sectionCount,

      totalFeesCollected,
      totalFeesPending,
      feeCollectionPercentage,

      feeTrend,
      attendanceTrend,
      studentDistribution,

      recentActivities,
      upcomingFees,
      upcomingExams,

      academicYear,
    };
  }
}
