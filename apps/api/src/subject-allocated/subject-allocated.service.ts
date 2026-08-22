import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectsAllocatedService {
  constructor(private prisma: PrismaService) {}

  async getAllocations(schoolId: string, teacherId: string) {
    return this.prisma.teacherSubjectAllocation.findMany({
      where: { schoolId, teacherId },
      include: {
        subject: { select: { id: true, name: true } },
        section: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } },
          },
        },
        academicYear: { select: { id: true, label: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
