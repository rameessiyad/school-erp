import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import {
  FileUploadService,
  UploadedFile,
} from 'src/file-upload/file-upload.service';
import { CreateStudentWithEnrollmentDto } from './dto/create-student-with-enrollment.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    schoolId: string,
    dto: CreateStudentWithEnrollmentDto,
    photo?: UploadedFile,
  ) {
    const existing = await this.prisma.student.findFirst({
      where: { schoolId, admissionNo: dto.admissionNo },
    });
    if (existing)
      throw new ConflictException('Admission number already in use');

    const { sectionId, academicYearId } = dto;
    const wantsEnrollment = !!(sectionId || academicYearId);

    // validate BEFORE uploading the photo or writing anything
    if (wantsEnrollment) {
      if (!sectionId || !academicYearId) {
        throw new BadRequestException(
          'Both section and academic year are required to enroll the student',
        );
      }
      await this.assertSectionInYear(schoolId, sectionId, academicYearId);
    }

    let photoUrl: string | undefined;
    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/students`,
      );
    }

    try {
      // student + enrollment succeed or fail together
      return await this.prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
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

        if (sectionId && academicYearId) {
          await tx.studentEnrollment.create({
            data: {
              schoolId,
              studentId: student.id,
              sectionId,
              academicYearId,
              rollNo: dto.rollNo || null,
            },
          });
        }

        return student;
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Admission number already in use');
      }
      throw e;
    }
  }

  async findAll(schoolId: string) {
    return this.prisma.student.findMany({ where: { schoolId } });
  }

  async findUnassigned(schoolId: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { schoolId, isActive: true },
    });

    return this.prisma.student.findMany({
      where: {
        schoolId,
        isActive: true,
        ...(activeYear
          ? {
              academicEnrollments: {
                none: {
                  academicYearId: activeYear.id,
                },
              },
            }
          : {
              // No active academic year at all — nobody can be "enrolled",
              // so treat every active student as unassigned.
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
    await this.assertSectionInYear(schoolId, dto.sectionId, dto.academicYearId);

    return this.prisma.studentEnrollment.upsert({
      where: {
        academicYearId_studentId: {
          academicYearId: dto.academicYearId,
          studentId,
        },
      },
      update: { sectionId: dto.sectionId, rollNo: dto.rollNo },
      create: {
        schoolId,
        studentId,
        sectionId: dto.sectionId,
        academicYearId: dto.academicYearId,
        rollNo: dto.rollNo,
      },
    });
  }

  // the section must belong to this school AND to the given academic year
  private async assertSectionInYear(
    schoolId: string,
    sectionId: string,
    academicYearId: string,
  ) {
    const section = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId, academicYearId },
    });
    if (!section) {
      throw new NotFoundException(
        'Section not found in the selected academic year',
      );
    }
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
