import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateAcademicYearDto) {
    const existing = await this.prisma.academicYear.findFirst({
      where: { schoolId, label: dto.label },
    });
    if (existing) throw new ConflictException('Academic year already exists');

    // If this one is marked active, deactivate any currently active year first
    if (dto.isActive) {
      await this.prisma.academicYear.updateMany({
        where: { schoolId, isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.academicYear.create({
      data: {
        schoolId,
        label: dto.label,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? false,
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.academicYear.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const year = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });
    if (!year) throw new NotFoundException('Academic year not found');
    return year;
  }

  async update(schoolId: string, id: string, dto: UpdateAcademicYearDto) {
    await this.findOne(schoolId, id);

    if (dto.isActive) {
      await this.prisma.academicYear.updateMany({
        where: { schoolId, isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.academicYear.delete({ where: { id } });
    return { message: 'Academic year deleted successfully' };
  }
}
