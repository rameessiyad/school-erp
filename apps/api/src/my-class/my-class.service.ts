import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class MyClassService {
  constructor(private prisma: PrismaService) {}

  private async getActiveAcademicYear(schoolId: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    if (!year) {
      throw new BadRequestException('No active academic year configured');
    }

    return year;
  }

  private async getOwnedSection(schoolId: string, teacherId: string) {
    const activeYear = await this.getActiveAcademicYear(schoolId);

    const section = await this.prisma.section.findFirst({
      where: {
        schoolId,
        classTeacherId: teacherId,
        academicYearId: activeYear.id,
      },
      include: { class: true },
    });

    if (!section) {
      throw new NotFoundException(
        'You are not assigned as a class teacher for any section this academic year',
      );
    }

    return { section, activeYear };
  }

  async getMyClass(schoolId: string, teacherId: string) {
    const { section } = await this.getOwnedSection(schoolId, teacherId);
    return section;
  }

  async getMyClassStudents(schoolId: string, teacherId: string) {
    const { section, activeYear } = await this.getOwnedSection(
      schoolId,
      teacherId,
    );

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        sectionId: section.id,
        academicYearId: activeYear.id,
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { student: { firstName: 'asc' } },
    });

    return enrollments.map((e) => ({
      ...e.student,
      rollNo: e.rollNo,
    }));
  }

  async getAttendanceForDate(
    schoolId: string,
    teacherId: string,
    date: string,
  ) {
    const { section, activeYear } = await this.getOwnedSection(
      schoolId,
      teacherId,
    );

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { schoolId, sectionId: section.id, academicYearId: activeYear.id },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { student: { firstName: 'asc' } },
    });

    const existing = await this.prisma.studentAttendance.findMany({
      where: {
        schoolId,
        sectionId: section.id,
        date: new Date(date),
      },
    });

    const statusByStudent = new Map(
      existing.map((a) => [a.studentId, a.status]),
    );

    return enrollments.map((e) => ({
      student: { ...e.student, rollNo: e.rollNo },
      status: statusByStudent.get(e.student.id) ?? null,
    }));
  }

  async markAttendance(
    schoolId: string,
    teacherId: string,
    dto: MarkAttendanceDto,
  ) {
    const { section, activeYear } = await this.getOwnedSection(
      schoolId,
      teacherId,
    );

    const studentIds = dto.entries.map((e) => e.studentId);

    const validEnrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        schoolId,
        sectionId: section.id,
        academicYearId: activeYear.id,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const validIds = new Set(validEnrollments.map((e) => e.studentId));
    const invalid = dto.entries.filter((e) => !validIds.has(e.studentId));

    if (invalid.length > 0) {
      throw new ForbiddenException(
        'One or more students do not belong to your class',
      );
    }

    const date = new Date(dto.date);

    return this.prisma.$transaction(
      dto.entries.map((entry) =>
        this.prisma.studentAttendance.upsert({
          where: {
            studentId_date: { studentId: entry.studentId, date },
          },
          create: {
            schoolId,
            studentId: entry.studentId,
            sectionId: section.id,
            markedByTeacherId: teacherId,
            date,
            status: entry.status,
          },
          update: {
            status: entry.status,
            markedByTeacherId: teacherId,
          },
        }),
      ),
    );
  }
}
