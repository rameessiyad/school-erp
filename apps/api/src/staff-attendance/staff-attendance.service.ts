import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkStaffAttendanceDto } from './dto/mark-staff-attendance.dto';

// Parses a "yyyy-MM-dd" string as a UTC calendar date (no timezone drift)
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Normalizes any Date to UTC midnight of the same UTC calendar date
function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

@Injectable()
export class StaffAttendanceService {
  constructor(private prisma: PrismaService) {}

  async mark(schoolId: string, staffId: string, dto: MarkStaffAttendanceDto) {
    const date = dto.date ? parseDateOnly(dto.date) : startOfDay(new Date());

    return this.prisma.staffAttendance.upsert({
      where: {
        staffId_date: { staffId, date },
      },
      update: { status: dto.status, markedAt: new Date() },
      create: { schoolId, staffId, date, status: dto.status },
    });
  }

  async findAll(
    schoolId: string,
    filters: { staffId?: string; from?: string; to?: string },
  ) {
    return this.prisma.staffAttendance.findMany({
      where: {
        schoolId,
        staffId: filters.staffId,
        date: {
          gte: filters.from ? parseDateOnly(filters.from) : undefined,
          lte: filters.to ? parseDateOnly(filters.to) : undefined,
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
          gte: filters.from ? parseDateOnly(filters.from) : undefined,
          lte: filters.to ? parseDateOnly(filters.to) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findAllByDate(schoolId: string, date?: string) {
    const day = date ? parseDateOnly(date) : startOfDay(new Date());

    const staffMembers = await this.prisma.staff.findMany({
      where: { schoolId },
      select: { id: true, firstName: true, lastName: true, photoUrl: true },
      orderBy: { firstName: 'asc' },
    });

    const records = await this.prisma.staffAttendance.findMany({
      where: { schoolId, date: day },
    });

    const statusByStaffId = new Map(records.map((r) => [r.staffId, r.status]));

    return {
      date: day,
      staff: staffMembers.map((s) => ({
        ...s,
        status: statusByStaffId.get(s.id) ?? null,
      })),
    };
  }
}
