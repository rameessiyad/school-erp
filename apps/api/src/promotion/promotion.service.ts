import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PromoteStudentsDto } from './dto/promote-students.dto';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  async getPreview(
    schoolId: string,
    fromAcademicYearId: string,
    toAcademicYearId: string,
  ) {
    const fromSections = await this.prisma.section.findMany({
      where: { schoolId, academicYearId: fromAcademicYearId },
      include: {
        class: true,
        studentEnrollments: {
          where: { student: { isActive: true } },
          select: { id: true },
        },
      },
    });

    const toSections = await this.prisma.section.findMany({
      where: { schoolId, academicYearId: toAcademicYearId },
      include: { class: true },
    });

    return fromSections.map((section) => {
      const targetClassId = section.class.promotesToClassId;
      const isGraduating = section.class.isGraduatingClass;

      const candidatesInTargetClass = targetClassId
        ? toSections.filter((s) => s.classId === targetClassId)
        : [];

      const suggestedMatch = candidatesInTargetClass.find(
        (s) => s.name === section.name,
      );

      return {
        fromSectionId: section.id,
        fromSectionLabel: `${section.class.name} - ${section.name}`,
        studentCount: section.studentEnrollments.length,
        isGraduating,
        suggestedToSectionId: suggestedMatch?.id ?? null,
        availableToSections: candidatesInTargetClass.map((s) => ({
          id: s.id,
          label: `${s.class.name} - ${s.name}`,
        })),
      };
    });
  }

  async promote(schoolId: string, dto: PromoteStudentsDto) {
    const { fromAcademicYearId, toAcademicYearId, sectionMappings } = dto;

    const [fromYear, toYear] = await Promise.all([
      this.prisma.academicYear.findFirst({
        where: { id: fromAcademicYearId, schoolId },
      }),
      this.prisma.academicYear.findFirst({
        where: { id: toAcademicYearId, schoolId },
      }),
    ]);

    if (!fromYear || !toYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Preserves each fee due date's position relative to the year start
    // (e.g. "2 weeks into term 1") when copying fee structures forward.
    const dayOffset = Math.round(
      (toYear.startDate.getTime() - fromYear.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return this.prisma.$transaction(async (tx) => {
      let studentsPromoted = 0;
      let feeStructuresCopied = 0;

      for (const mapping of sectionMappings) {
        const fromSection = await tx.section.findFirst({
          where: { id: mapping.fromSectionId, schoolId },
        });
        const toSection = await tx.section.findFirst({
          where: { id: mapping.toSectionId, schoolId },
        });

        if (!fromSection || !toSection) continue;

        const enrollments = await tx.studentEnrollment.findMany({
          where: {
            sectionId: fromSection.id,
            academicYearId: fromAcademicYearId,
            student: { isActive: true },
          },
        });

        for (const enrollment of enrollments) {
          await tx.studentEnrollment.upsert({
            where: {
              academicYearId_studentId: {
                academicYearId: toAcademicYearId,
                studentId: enrollment.studentId,
              },
            },
            create: {
              schoolId,
              academicYearId: toAcademicYearId,
              studentId: enrollment.studentId,
              sectionId: toSection.id,
              rollNo: enrollment.rollNo,
            },
            update: {
              sectionId: toSection.id,
            },
          });
          studentsPromoted += 1;
        }

        // Copy fee structures forward for the target class, once per class
        const existingFeeStructures = await tx.feeStructure.findMany({
          where: {
            schoolId,
            academicYearId: toAcademicYearId,
            classId: toSection.classId,
          },
        });

        if (existingFeeStructures.length === 0) {
          const oldFeeStructures = await tx.feeStructure.findMany({
            where: {
              schoolId,
              academicYearId: fromAcademicYearId,
              classId: fromSection.classId,
            },
          });

          for (const fs of oldFeeStructures) {
            const newDueDate = new Date(fs.dueDate);
            newDueDate.setDate(newDueDate.getDate() + dayOffset);

            await tx.feeStructure.create({
              data: {
                schoolId,
                academicYearId: toAcademicYearId,
                classId: toSection.classId,
                name: fs.name,
                amount: fs.amount,
                frequency: fs.frequency,
                dueDate: newDueDate,
                description: fs.description,
                isActive: fs.isActive,
              },
            });
            feeStructuresCopied += 1;
          }
        }
      }

      return { studentsPromoted, feeStructuresCopied };
    });
  }
}
