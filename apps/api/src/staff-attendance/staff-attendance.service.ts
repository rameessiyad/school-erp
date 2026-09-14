import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkStaffAttendanceDto } from './dto/mark-staff-attendance.dto';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class StaffAttendanceService {
  constructor(private prisma: PrismaService) {}

  // Staff marks their own attendance for a given day (defaults to today)
  async mark(schoolId: string, staffId: string, dto: MarkStaffAttendanceDto) {
    const date = startOfDay(dto.date ? new Date(dto.date) : new Date());

    return this.prisma.staffAttendance.upsert({
      where: {
        staffId_date: { staffId, date },
      },
      update: { status: dto.status, markedAt: new Date() },
      create: { schoolId, staffId, date, status: dto.status },
    });
  }

  // Admin: list all attendance, optionally filtered
  async findAll(
    schoolId: string,
    filters: { staffId?: string; from?: string; to?: string },
  ) {
    return this.prisma.staffAttendance.findMany({
      where: {
        schoolId,
        staffId: filters.staffId,
        date: {
          gte: filters.from ? startOfDay(new Date(filters.from)) : undefined,
          lte: filters.to ? startOfDay(new Date(filters.to)) : undefined,
        },
      },
      include: {
        staff: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Staff: their own attendance history
  async findMine(
    schoolId: string,
    staffId: string,
    filters: { from?: string; to?: string },
  ) {
    return this.prisma.staffAttendance.findMany({
      where: {
        schoolId,
        staffId,
        date: {
          gte: filters.from ? startOfDay(new Date(filters.from)) : undefined,
          lte: filters.to ? startOfDay(new Date(filters.to)) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
