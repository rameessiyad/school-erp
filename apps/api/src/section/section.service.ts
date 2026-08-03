import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateSectionDto) {
    const existing = await this.prisma.section.findFirst({
      where: {
        academicYearId: dto.academicYearId,
        classId: dto.classId,
        name: dto.name,
      },
    });
    if (existing)
      throw new ConflictException(
        'Section already exists for this class and year',
      );

    return this.prisma.section.create({
      data: {
        schoolId,
        name: dto.name,
        classId: dto.classId,
        academicYearId: dto.academicYearId,
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.section.findMany({
      where: { schoolId },
      include: { class: true, academicYear: true },
    });
  }

  async findOne(schoolId: string, id: string) {
    const section = await this.prisma.section.findFirst({
      where: { id, schoolId },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(schoolId: string, id: string, dto: UpdateSectionDto) {
    await this.findOne(schoolId, id);
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.section.delete({ where: { id } });
    return { message: 'Section deleted successfully' };
  }
}
