import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';

@Injectable()
export class ExamTypeService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateExamTypeDto) {
    const existing = await this.prisma.examType.findFirst({
      where: { schoolId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException('An exam type with this name already exists');
    }

    return this.prisma.examType.create({
      data: { schoolId, name: dto.name },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.examType.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  async remove(schoolId: string, id: string) {
    const examType = await this.prisma.examType.findFirst({
      where: { id, schoolId },
    });
    if (!examType) throw new NotFoundException('Exam type not found');

    if (examType.isDefault) {
      throw new BadRequestException('Default exam types cannot be deleted');
    }

    const inUse = await this.prisma.exam.findFirst({
      where: { examTypeId: id },
    });
    if (inUse) {
      throw new BadRequestException(
        'Cannot delete an exam type that is used by existing exams',
      );
    }

    await this.prisma.examType.delete({ where: { id } });
    return { message: 'Exam type deleted successfully' };
  }
}
