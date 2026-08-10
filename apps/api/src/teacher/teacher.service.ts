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
import { CreateAllocationDto } from './dto/create-allocation.dto';
import {
  FileUploadService,
  UploadedFile,
} from 'src/file-upload/file-upload.service';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(schoolId: string, dto: CreateTeacherDto, photo?: UploadedFile) {
    const existing = await this.prisma.user.findFirst({
      where: { schoolId, email: dto.email },
    });

    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/teachers`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          role: Role.TEACHER,
          email: dto.email,
          passwordHash,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          schoolId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          employeeId: dto.employeeId,
          gender: dto.gender,
          dob: dto.dob ? new Date(dto.dob) : undefined,
          qualification: dto.qualification,
          experience: dto.experience,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
          photoUrl,
        },
      });

      if (dto.allocations?.length) {
        await tx.teacherSubjectAllocation.createMany({
          data: dto.allocations.map((a) => ({
            schoolId,
            teacherId: teacher.id,
            subjectId: a.subjectId,
            sectionId: a.sectionId,
            academicYearId: a.academicYearId,
          })),
        });
      }

      return tx.teacher.findUnique({
        where: { id: teacher.id },
        include: { teacherSubjectAllocations: true },
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

  async update(
    schoolId: string,
    id: string,
    dto: UpdateTeacherDto,
    photo?: UploadedFile,
  ) {
    await this.findOne(schoolId, id);
    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/teachers`,
      );
    }
    return this.prisma.teacher.update({
      where: { id },
      data: {
        ...dto,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        ...(photoUrl && { photoUrl }),
      },
    });
  }

  async remove(schoolId: string, id: string) {
    const teacher = await this.findOne(schoolId, id);
    await this.prisma.user.delete({ where: { id: teacher.userId } });
    return { message: 'Teacher deleted successfully' };
  }

  // allocation
  async addAllocation(
    schoolId: string,
    teacherId: string,
    dto: CreateAllocationDto,
  ) {
    await this.findOne(schoolId, teacherId);

    const existing = await this.prisma.teacherSubjectAllocation.findFirst({
      where: {
        teacherId,
        subjectId: dto.subjectId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
      },
    });

    if (existing) throw new ConflictException('This allocation already exists');

    return this.prisma.teacherSubjectAllocation.create({
      data: {
        schoolId,
        teacherId,
        subjectId: dto.subjectId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
      },
    });
  }

  async removeAllocation(
    schoolId: string,
    teacherId: string,
    allocationId: string,
  ) {
    const allocation = await this.prisma.teacherSubjectAllocation.findFirst({
      where: { id: allocationId, teacherId, schoolId },
    });
    if (!allocation) throw new NotFoundException('Allocation not found');

    await this.prisma.teacherSubjectAllocation.delete({
      where: { id: allocationId },
    });
    return { message: 'Allocation removed successfully' };
  }

  async listAllocations(schoolId: string, teacherId: string) {
    await this.findOne(schoolId, teacherId);
    return this.prisma.teacherSubjectAllocation.findMany({
      where: { teacherId, schoolId },
      include: { subject: true, section: true, academicYear: true },
    });
  }
}
