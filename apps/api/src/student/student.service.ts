import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import {
  FileUploadService,
  UploadedFile,
} from 'src/file-upload/file-upload.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(schoolId: string, dto: CreateStudentDto, photo?: UploadedFile) {
    const existing = await this.prisma.student.findFirst({
      where: { schoolId, admissionNo: dto.admissionNo },
    });

    if (existing)
      throw new ConflictException('Admission number already in use');

    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/students`,
      );
    }

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
        photoUrl,
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.student.findMany({ where: { schoolId } });
  }

  async findUnassigned(schoolId: string, classId?: string, sectionId?: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    return this.prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        enrollments: {
          none: {},
        },
        ...(activeYear && {
          academicEnrollments: {
            some: {
              academicYearId: activeYear.id,
              ...(sectionId && { sectionId }),
              ...(classId &&
                !sectionId && {
                  section: { classId },
                }),
            },
          },
        }),
      },
      orderBy: { firstName: 'asc' },
    });
  }
  async findOne(schoolId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(
    schoolId: string,
    id: string,
    dto: UpdateStudentDto,
    photo?: UploadedFile,
  ) {
    await this.findOne(schoolId, id);

    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/students`,
      );
    }
    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : undefined,
        ...(photoUrl && { photoUrl }),
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student deleted successfully' };
  }

  //   enrollment
  async enroll(schoolId: string, studentId: string, dto: EnrollStudentDto) {
    await this.findOne(schoolId, studentId);

    const section = await this.prisma.section.findFirst({
      where: { id: dto.sectionId, schoolId },
    });
    if (!section) throw new NotFoundException('Section not found');

    return this.prisma.studentEnrollment.upsert({
      where: {
        academicYearId_studentId: {
          academicYearId: dto.academicYearId,
          studentId,
        },
      },
      update: {
        sectionId: dto.sectionId,
        rollNo: dto.rollNo,
      },
      create: {
        schoolId,
        studentId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
        rollNo: dto.rollNo,
      },
    });
  }

  async getEnrollment(
    schoolId: string,
    studentId: string,
    academicYearId: string,
  ) {
    await this.findOne(schoolId, studentId);

    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { academicYearId_studentId: { academicYearId, studentId } },
      include: { section: { include: { class: true } } },
    });
    if (!enrollment)
      throw new NotFoundException('No enrollment found for this year');
    return enrollment;
  }
}
