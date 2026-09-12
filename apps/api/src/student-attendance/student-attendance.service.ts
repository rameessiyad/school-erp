import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';

@Injectable()
export class StudentAttendanceService {
  constructor(private prisma: PrismaService) {}

  async getMyClassStudents(schoolId: string, teacherId: string, date: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });
    if (!activeYear) throw new NotFoundException('No active academic year');

    const section = await this.prisma.section.findFirst({
      where: {
        schoolId,
        academicYearId: activeYear.id,
        classTeacherId: teacherId,
      },
      include: { class: true },
    });
    if (!section) {
      throw new NotFoundException(
        'You are not assigned as class teacher for any section',
      );
    }

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: { sectionId: section.id, academicYearId: activeYear.id },
      include: { student: true },
      orderBy: { rollNo: 'asc' },
    });

    const existing = await this.prisma.studentAttendance.findMany({
      where: { sectionId: section.id, date: new Date(date) },
    });
    const existingMap = new Map(existing.map((e) => [e.studentId, e.status]));

    return {
      section: {
        id: section.id,
        name: section.name,
        className: section.class.name,
      },
      students: enrollments.map((e) => ({
        studentId: e.student.id,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        rollNo: e.rollNo,
        photoUrl: e.student.photoUrl,
        status: existingMap.get(e.student.id) ?? 'PRESENT',
      })),
    };
  }

  async markAttendance(
    schoolId: string,
    teacherId: string,
    dto: MarkStudentAttendanceDto,
  ) {
    const section = await this.prisma.section.findFirst({
      where: { id: dto.sectionId, schoolId, classTeacherId: teacherId },
    });
    if (!section) {
      throw new ForbiddenException(
        'You are not the class teacher for this section',
      );
    }

    const date = new Date(dto.date);

    const results = await this.prisma.$transaction(
      dto.records.map((record) =>
        this.prisma.studentAttendance.upsert({
          where: { studentId_date: { studentId: record.studentId, date } },
          update: {
            status: record.status,
            sectionId: section.id,
            markedByTeacherId: teacherId,
          },
          create: {
            schoolId,
            studentId: record.studentId,
            sectionId: section.id,
            markedByTeacherId: teacherId,
            date,
            status: record.status,
          },
        }),
      ),
    );

    return { message: 'Attendance marked successfully', count: results.length };
  }
}
