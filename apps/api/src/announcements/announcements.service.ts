import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import {
  AnnouncementAudience,
  Prisma,
  Role,
} from '../../generated/prisma/client';

const addDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(private prisma: PrismaService) {}

  create(schoolId: string, userId: string, dto: CreateAnnouncementDto) {
    const { expiryDays, ...rest } = dto;
    return this.prisma.announcement.create({
      data: {
        ...rest,
        schoolId,
        createdById: userId,
        expiresAt: addDays(expiryDays),
      },
    });
  }

  // Admins see everything active; other roles only see what targets them
  findAll(schoolId: string, role: Role, category?: string) {
    const audienceMap: Partial<Record<Role, AnnouncementAudience>> = {
      TEACHER: 'TEACHERS',
      PARENT: 'PARENTS',
      STAFF: 'STAFF',
    };
    const roleAudience = audienceMap[role];

    const where: Prisma.AnnouncementWhereInput = {
      schoolId,
      expiresAt: { gt: new Date() }, // hides expired ones even before the cron runs
      ...(category && { category: category as any }),
      ...(roleAudience && { audience: { in: ['ALL', roleAudience] } }),
    };

    return this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const item = await this.prisma.announcement.findFirst({
      where: { id, schoolId, expiresAt: { gt: new Date() } },
    });
    if (!item) throw new NotFoundException('Announcement not found');
    return item;
  }

  async update(schoolId: string, id: string, dto: UpdateAnnouncementDto) {
    await this.findOne(schoolId, id);
    const { expiryDays, ...rest } = dto;
    return this.prisma.announcement.update({
      where: { id },
      data: { ...rest, ...(expiryDays && { expiresAt: addDays(expiryDays) }) },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }

  // Runs every hour and hard-deletes expired announcements across all schools
  @Cron(CronExpression.EVERY_HOUR)
  async deleteExpired() {
    const { count } = await this.prisma.announcement.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    if (count) this.logger.log(`Deleted ${count} expired announcement(s)`);
  }
}
