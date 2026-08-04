import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateStudentDto) {
    const existing = await this.prisma.student.findFirst({
      where: { schoolId, admissionNo: dto.admissionNo },
    });

    if (existing)
      throw new ConflictException('Admission number already in use');

    return this.prisma.student.create({
      data: {
        schoolId,
        admissionNo: dto.admissionNo,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        bloodGroup: dto.bloodGroup,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : undefined,
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.student.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(schoolId: string, id: string, dto: UpdateStudentDto) {
    await this.findOne(schoolId, id);
    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : undefined,
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }
}
