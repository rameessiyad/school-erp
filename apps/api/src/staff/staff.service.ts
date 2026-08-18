import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { UpdateStaffDto } from './dto/update-staff.dto';
import {
  FileUploadService,
  UploadedFile,
} from 'src/file-upload/file-upload.service';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async createStaff(
    schoolId: string,
    dto: CreateStaffDto,
    photo?: UploadedFile,
  ) {
    const existing = await this.prisma.staff.findFirst({
      where: { schoolId, email: dto.email },
    });

    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/staff`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          role: Role.STAFF,
          email: dto.email,
          passwordHash,
        },
      });

      return tx.staff.create({
        data: {
          schoolId,
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          designation: dto.designation,
          photoUrl,
        },
      });
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.staff.findMany({ where: { schoolId } });
  }

  async findOne(schoolId: string, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { id, schoolId },
    });

    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async updateStaff(
    schoolId: string,
    id: string,
    dto: UpdateStaffDto,
    photo?: UploadedFile,
  ) {
    await this.findOne(schoolId, id);

    let photoUrl: string | undefined;

    if (photo) {
      photoUrl = await this.fileUploadService.uploadImage(
        photo,
        `schools/${schoolId}/staff`,
      );
    }

    return this.prisma.staff.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        designation: dto.designation,
        ...(photoUrl && { photoUrl }),
      },
    });
  }

  async removeStaff(schoolId: string, id: string) {
    const staff = await this.findOne(schoolId, id);

    await this.prisma.user.delete({ where: { id: staff.userId } });

    return { message: 'Staff deleted successfully' };
  }
}
