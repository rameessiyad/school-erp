import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findFirst({
      where: { schoolId, name: dto.name },
    });

    if (existing) throw new ConflictException('Subject already exists');

    return this.prisma.subject.create({
      data: { schoolId, name: dto.name, code: dto.code },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.subject.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, schoolId },
    });

    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(schoolId: string, id: string, dto: UpdateSubjectDto) {
    await this.findOne(schoolId, id);
    return this.prisma.subject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.subject.delete({ where: { id } });
    return { message: 'Subject deleted successfully' };
  }
}
