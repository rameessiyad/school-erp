import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateTeacherDto) {
    const existing = await this.prisma.teacher.findFirst({
      where: { schoolId, email: dto.email },
    });

    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          role: Role.TEACHER,
          email: dto.email,
          passwordHash,
        },
      });

      return tx.teacher.create({
        data: {
          schoolId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          employeeId: dto.employeeId,
          gender: dto.gender,
          dob: dto.dob,
          qualification: dto.qualification,
          experience: dto.experience,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        },
      });
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.teacher.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async update(schoolId: string, id: string, dto: UpdateTeacherDto) {
    await this.findOne(schoolId, id);
    return this.prisma.teacher.update({
      where: { id },
      data: dto,
    });
  }

  async remove(schoolId: string, id: string) {
    const teacher = await this.findOne(schoolId, id);
    await this.prisma.user.delete({ where: { id: teacher.userId } });
    return { message: 'Teacher deleted successfully' };
  }
}
