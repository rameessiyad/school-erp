import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateClassDto) {
    const existing = await this.prisma.class.findFirst({
      where: { schoolId, name: dto.name },
    });
    if (existing) throw new ConflictException('Class already exists');

    return this.prisma.class.create({
      data: { schoolId, name: dto.name },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.class.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const cls = await this.prisma.class.findFirst({ where: { id, schoolId } });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async update(schoolId: string, id: string, dto: UpdateClassDto) {
    await this.findOne(schoolId, id);
    return this.prisma.class.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.class.delete({ where: { id } });
    return { message: 'Class deleted successfully' };
  }
}
