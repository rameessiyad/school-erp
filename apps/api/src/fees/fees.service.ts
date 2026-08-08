import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { FeeStatus } from 'generated/prisma/enums';

@Injectable()
export class FeeStructureService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateFeeStructureDto) {
    // Prevent duplicate fee structure for same class/year/name
    const existing = await this.prisma.feeStructure.findUnique({
      where: {
        schoolId_academicYearId_classId_name: {
          schoolId,
          academicYearId: dto.academicYearId,
          classId: dto.classId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Fee structure "${dto.name}" already exists for this class and year`,
      );
    }

    // Find all students currently enrolled in this class for this academic year
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        academicYearId: dto.academicYearId,
        section: { classId: dto.classId },
      },
      select: { studentId: true },
    });

    if (enrollments.length === 0) {
      throw new NotFoundException(
        'No students are currently enrolled in this class for the selected academic year',
      );
    }

    // Create FeeStructure + StudentFee records for every enrolled student, atomically
    return this.prisma.$transaction(async (tx) => {
      const feeStructure = await tx.feeStructure.create({
        data: {
          schoolId,
          academicYearId: dto.academicYearId,
          classId: dto.classId,
          name: dto.name,
          amount: dto.amount,
          frequency: dto.frequency,
          dueDate: new Date(dto.dueDate),
          description: dto.description,
        },
      });

      await tx.studentFee.createMany({
        data: enrollments.map((enrollment) => ({
          studentId: enrollment.studentId,
          feeStructureId: feeStructure.id,
          totalAmount: dto.amount,
          discountAmount: 0,
          dueDate: new Date(dto.dueDate), // inherited from FeeStructure
          status: FeeStatus.PENDING,
        })),
      });

      return feeStructure;
    });
  }

  async findAll(schoolId: string, academicYearId?: string, classId?: string) {
    return this.prisma.feeStructure.findMany({
      where: {
        schoolId,
        ...(academicYearId && { academicYearId }),
        ...(classId && { classId }),
      },
      include: { class: true, academicYear: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { id, schoolId },
      include: { class: true, academicYear: true },
    });

    if (!feeStructure) throw new NotFoundException('Fee structure not found');

    return feeStructure;
  }

  async update(schoolId: string, id: string, dto: UpdateFeeStructureDto) {
    await this.findOne(schoolId, id); // ensures existence + tenant scope

    return this.prisma.feeStructure.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(schoolId: string, id: string) {
    await this.findOne(schoolId, id);

    return this.prisma.feeStructure.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
