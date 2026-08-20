import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { ReviewLeaveDto } from './dto/review-leave.dto';
import { LeaveStatus } from 'generated/prisma/enums';

@Injectable()
export class TeacherLeaveService {
  constructor(private prisma: PrismaService) {}

  async apply(schoolId: string, teacherId: string, dto: ApplyLeaveDto) {
    if (new Date(dto.fromDate) > new Date(dto.toDate)) {
      throw new BadRequestException('fromDate cannot be after toDate');
    }

    return this.prisma.teacherLeaveApplication.create({
      data: {
        schoolId,
        teacherId,
        fromDate: new Date(dto.fromDate),
        toDate: new Date(dto.toDate),
        reason: dto.reason,
      },
    });
  }

  async findAll(schoolId: string, filters: { status?: LeaveStatus }) {
    return this.prisma.teacherLeaveApplication.findMany({
      where: { schoolId, status: filters.status },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findMine(schoolId: string, teacherId: string) {
    return this.prisma.teacherLeaveApplication.findMany({
      where: { schoolId, teacherId },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async review(
    schoolId: string,
    id: string,
    reviewerId: string,
    dto: ReviewLeaveDto,
  ) {
    const leave = await this.prisma.teacherLeaveApplication.findFirst({
      where: { id, schoolId },
    });

    if (!leave) throw new NotFoundException('Leave application not found');

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'This leave application is already reviewed',
      );
    }

    return this.prisma.teacherLeaveApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }
}
