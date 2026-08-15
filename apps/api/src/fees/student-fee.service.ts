import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryStudentFeeDto } from './dto/query-student-fee.dto';

@Injectable()
export class StudentFeeService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId: string, query: QueryStudentFeeDto) {
    const { academicYearId, classId, sectionId, status, search } = query;

    return this.prisma.studentFee.findMany({
      where: {
        feeStructure: {
          schoolId,
          ...(academicYearId && { academicYearId }),
          ...(classId && { classId }),
        },
        ...(status && { status }),
        // NOTE: adjust `enrollments` relation name / field names to match
        // your actual StudentEnrollment relation on Student
        ...(sectionId && {
          student: {
            enrollments: {
              some: {
                sectionId,
                ...(academicYearId && { academicYearId }),
              },
            },
          },
        }),
        ...(search && {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { admissionNo: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
          },
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            amount: true,
            frequency: true,
            dueDate: true,
            class: { select: { id: true, name: true } },
          },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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

  async findByStudent(schoolId: string, studentId: string) {
    return this.prisma.studentFee.findMany({
      where: { studentId, feeStructure: { schoolId } },
      include: {
        feeStructure: { include: { class: true, academicYear: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
