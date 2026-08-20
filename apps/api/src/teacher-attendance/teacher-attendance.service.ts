import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class TeacherAttendanceService {
  constructor(private prisma: PrismaService) {}

  // Teacher marks their own attendance for a given day (defaults to today)
  async mark(schoolId: string, teacherId: string, dto: MarkAttendanceDto) {
    const date = startOfDay(dto.date ? new Date(dto.date) : new Date());

    return this.prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: { teacherId, date },
      },
      update: { status: dto.status, markedAt: new Date() },
      create: { schoolId, teacherId, date, status: dto.status },
    });
  }

  // Admin: list all attendance, optionally filtered
  async findAll(
    schoolId: string,
    filters: { teacherId?: string; from?: string; to?: string },
  ) {
    return this.prisma.teacherAttendance.findMany({
      where: {
        schoolId,
        teacherId: filters.teacherId,
        date: {
          gte: filters.from ? startOfDay(new Date(filters.from)) : undefined,
          lte: filters.to ? startOfDay(new Date(filters.to)) : undefined,
        },
      },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Teacher: their own attendance history
  async findMine(
    schoolId: string,
    teacherId: string,
    filters: { from?: string; to?: string },
  ) {
    return this.prisma.teacherAttendance.findMany({
      where: {
        schoolId,
        teacherId,
        date: {
          gte: filters.from ? startOfDay(new Date(filters.from)) : undefined,
          lte: filters.to ? startOfDay(new Date(filters.to)) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
