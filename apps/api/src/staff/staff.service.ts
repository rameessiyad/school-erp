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

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async createStaff(schoolId: string, dto: CreateStaffDto) {
    const existing = await this.prisma.staff.findFirst({
      where: { schoolId, email: dto.email },
    });

    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

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

  async updateStaff(schoolId: string, id: string, dto: UpdateStaffDto) {
    await this.findOne(schoolId, id);

    return this.prisma.staff.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        designation: dto.designation,
      },
    });
  }

  async removeStaff(schoolId: string, id: string) {
    const staff = await this.findOne(schoolId, id);

    await this.prisma.user.delete({ where: { id: staff.userId } });

    return { message: 'Staff deleted successfully' };
  }
}
