import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplyStaffLeaveDto } from './dto/apply-staff-leave.dto';
import { ReviewStaffLeaveDto } from './dto/review-staff-leave.dto';
import { LeaveStatus } from 'generated/prisma/enums';

@Injectable()
export class StaffLeaveService {
  constructor(private prisma: PrismaService) {}

  async apply(schoolId: string, staffId: string, dto: ApplyStaffLeaveDto) {
    if (new Date(dto.fromDate) > new Date(dto.toDate)) {
      throw new BadRequestException('fromDate cannot be after toDate');
    }

    return this.prisma.staffLeaveApplication.create({
      data: {
        schoolId,
        staffId,
        fromDate: new Date(dto.fromDate),
        toDate: new Date(dto.toDate),
        reason: dto.reason,
      },
    });
  }

  async findAll(schoolId: string, filters: { status?: LeaveStatus }) {
    return this.prisma.staffLeaveApplication.findMany({
      where: { schoolId, status: filters.status },
      include: {
        staff: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findMine(schoolId: string, staffId: string) {
    return this.prisma.staffLeaveApplication.findMany({
      where: { schoolId, staffId },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async review(
    schoolId: string,
    id: string,
    reviewerId: string,
    dto: ReviewStaffLeaveDto,
  ) {
    const leave = await this.prisma.staffLeaveApplication.findFirst({
      where: { id, schoolId },
    });

    if (!leave) throw new NotFoundException('Leave application not found');

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'This leave application is already reviewed',
      );
    }

    return this.prisma.staffLeaveApplication.update({
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
