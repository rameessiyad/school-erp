import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateExamDto) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id: dto.academicYearId, schoolId },
    });
    if (!academicYear) throw new NotFoundException('Academic year not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const existing = await this.prisma.exam.findFirst({
      where: {
        academicYearId: dto.academicYearId,
        name: dto.name,
      },
    });
    if (existing) {
      throw new ConflictException(
        'An exam with this name already exists for this academic year',
      );
    }

    return this.prisma.exam.create({
      data: {
        name: dto.name,
        examType: dto.examType,
        startDate,
        endDate,
        academicYearId: dto.academicYearId,
        status: dto.status,
      },
    });
  }

  async findAll(schoolId: string, academicYearId?: string) {
    return this.prisma.exam.findMany({
      where: {
        academicYear: { schoolId },
        ...(academicYearId && { academicYearId }),
      },
      include: { academicYear: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, academicYear: { schoolId } },
      include: { academicYear: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(schoolId: string, id: string, dto: UpdateExamDto) {
    await this.findOne(schoolId, id);

    if (dto.academicYearId) {
      const academicYear = await this.prisma.academicYear.findFirst({
        where: { id: dto.academicYearId, schoolId },
      });
      if (!academicYear) {
        throw new NotFoundException('Academic year not found');
      }
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    return this.prisma.exam.update({
      where: { id },
      data: {
        ...dto,
        startDate,
        endDate,
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.exam.delete({ where: { id } });
    return { message: 'Exam deleted successfully' };
  }
}
