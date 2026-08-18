import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { AssignClassTeacherDto } from 'src/teacher/dto/assign-class-teacher.dto';

@Injectable()
export class SectionService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateSectionDto) {
    const existing = await this.prisma.section.findFirst({
      where: {
        academicYearId: dto.academicYearId,
        classId: dto.classId,
        name: dto.name,
      },
    });
    if (existing)
      throw new ConflictException(
        'Section already exists for this class and year',
      );

    return this.prisma.section.create({
      data: {
        schoolId,
        name: dto.name,
        classId: dto.classId,
        academicYearId: dto.academicYearId,
      },
    });
  }

  async findAll(schoolId: string, classId: string) {
    return this.prisma.section.findMany({
      where: { schoolId, ...(classId && { classId }) },
      include: { class: true, academicYear: true },
    });
  }

  async findOne(schoolId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, schoolId },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(schoolId: string, id: string, dto: UpdateSectionDto) {
    await this.findOne(schoolId, id);
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.section.delete({ where: { id } });
    return { message: 'Section deleted successfully' };
  }

  //class teacher assignment
  async assignClassTeacher(
    schoolId: string,
    sectionId: string,
    dto: AssignClassTeacherDto,
  ) {
    await this.findOne(schoolId, sectionId);

    const teacher = await this.prisma.teacher.findFirst({
      where: { id: dto.teacherId, schoolId },
    });

    if (!teacher) throw new NotFoundException('Teacher not found');

    return this.prisma.classTeacherAssignment.upsert({
      where: {
        academicYearId_sectionId: {
          academicYearId: dto.academicYearId,
          sectionId,
        },
      },
      update: { teacherId: dto.teacherId },
      create: {
        schoolId,
        sectionId,
        teacherId: dto.teacherId,
        academicYearId: dto.academicYearId,
      },
    });
  }

  async getClassTeacher(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
  ) {
    await this.findOne(schoolId, sectionId);

    const assignment = await this.prisma.classTeacherAssignment.findUnique({
      where: {
        academicYearId_sectionId: { academicYearId, sectionId },
      },
      include: { teacher: true },
    });

    if (!assignment)
      throw new NotFoundException(
        'No class teacher assigned for this section/year',
      );
    return assignment;
  }

  async getSectionDetails(schoolId: string, sectionId: string) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId },
      include: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const academicYear =
      (await this.prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      })) ??
      (await this.prisma.academicYear.findFirst({
        where: { schoolId },
        orderBy: { startDate: 'desc' },
      }));

    if (!academicYear) {
      return { section, academicYear: null, classTeacher: null, students: [] };
    }

    const [classTeacherAssignment, enrollments] = await Promise.all([
      this.prisma.classTeacherAssignment.findUnique({
        where: {
          academicYearId_sectionId: {
            academicYearId: academicYear.id,
            sectionId,
          },
        },
        include: { teacher: true },
      }),
      this.prisma.studentEnrollment.findMany({
        where: { sectionId, academicYearId: academicYear.id },
        include: { student: true },
        orderBy: { rollNo: 'asc' },
      }),
    ]);

    return {
      section,
      academicYear,
      classTeacher: classTeacherAssignment?.teacher ?? null,
      students: enrollments.map((e) => ({
        enrollmentId: e.id,
        rollNo: e.rollNo,
        ...e.student,
      })),
    };
  }

  async getSectionParents(schoolId: string, sectionId: string) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId },
      include: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const academicYear =
      (await this.prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      })) ??
      (await this.prisma.academicYear.findFirst({
        where: { schoolId },
        orderBy: { startDate: 'desc' },
      }));

    if (!academicYear) {
      return { section, academicYear: null, parents: [] };
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { sectionId, academicYearId: academicYear.id },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    if (studentIds.length === 0) {
      return { section, academicYear, parents: [] };
    }

    const parents = await this.prisma.parent.findMany({
      where: {
        schoolId,
        parentStudents: { some: { studentId: { in: studentIds } } },
      },
      include: {
        parentStudents: {
          where: { studentId: { in: studentIds } },
          include: { student: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return { section, academicYear, parents };
  }

  async getSectionAllocations(schoolId: string, sectionId: string) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId },
      include: { class: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const academicYear =
      (await this.prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      })) ??
      (await this.prisma.academicYear.findFirst({
        where: { schoolId },
        orderBy: { startDate: 'desc' },
      }));

    if (!academicYear) {
      return { section, academicYear: null, allocations: [] };
    }

    const allocations = await this.prisma.teacherSubjectAllocation.findMany({
      where: { sectionId, academicYearId: academicYear.id, schoolId },
      include: { teacher: true, subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    return { section, academicYear, allocations };
  }
}
