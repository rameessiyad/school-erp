import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Role } from 'generated/prisma/enums';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}


  async create(schoolId: string, dto: CreateParentDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { schoolId, email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, schoolId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          role: Role.PARENT,
          phone: dto.phone,
          email: dto.email,
        },
      });

      const parent = await tx.parent.create({
        data: {
          schoolId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          occupation: dto.occupation,
        },
      });

      await tx.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: dto.studentId,
          relationship: dto.relationship,
          isPrimary: dto.isPrimary ?? false,
        },
      });

      return tx.parent.findUnique({
        where: { id: parent.id },
        include: { parentStudents: { include: { student: true } } },
      });
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.parent.findMany({
      where: { schoolId },
      include: { parentStudents: { include: { student: true } } },
    });
  }

  async findOne(schoolId: string, id: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, schoolId },
      include: { parentStudents: { include: { student: true } } },
    });
    if (!parent) throw new NotFoundException('Parent not found');
    return parent;
  }

  async update(schoolId: string, id: string, dto: UpdateParentDto) {
    await this.findOne(schoolId, id);
    return this.prisma.parent.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string) {
    const parent = await this.findOne(schoolId, id);
    await this.prisma.user.delete({ where: { id: parent.userId } });
    return { message: 'Parent deleted successfully' };
  }
}
