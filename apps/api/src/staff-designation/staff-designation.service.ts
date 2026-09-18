import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDesignationDto } from './dto/create-staff-designation.dto';
import { UpdateStaffDesignationDto } from './dto/update-staff-designation.dto';

@Injectable()
export class StaffDesignationService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateStaffDesignationDto) {
    const existing = await this.prisma.staffDesignation.findFirst({
      where: { schoolId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Designation already exists');
    }

    return this.prisma.staffDesignation.create({
      data: {
        schoolId,
        name: dto.name,
        allowedModules: dto.allowedModules ?? [],
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.staffDesignation.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const designation = await this.prisma.staffDesignation.findFirst({
      where: { id, schoolId },
    });
    if (!designation) throw new NotFoundException('Designation not found');
    return designation;
  }

  async update(schoolId: string, id: string, dto: UpdateStaffDesignationDto) {
    await this.findOne(schoolId, id);

    if (dto.name) {
      const existing = await this.prisma.staffDesignation.findFirst({
        where: { schoolId, name: dto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Designation already exists');
      }
    }

    return this.prisma.staffDesignation.update({
      where: { id },
      data: dto,
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);

    const staffCount = await this.prisma.staff.count({
      where: { designationId: id },
    });
    if (staffCount > 0) {
      throw new ConflictException(
        `Cannot delete — ${staffCount} staff member(s) currently have this designation`,
      );
    }

    await this.prisma.staffDesignation.delete({ where: { id } });
    return { message: 'Designation deleted successfully' };
  }
}
