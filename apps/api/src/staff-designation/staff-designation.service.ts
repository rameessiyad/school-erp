import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MODULE_GROUPS } from 'src/common/permissions/module-groups';
import { CreateStaffDesignationDto } from './dto/create-staff-designation.dto';
import { UpdateStaffDesignationDto } from './dto/update-staff-designation.dto';

// typed as Set<string> so incoming DTO strings can be checked against it
const VALID_MODULES = new Set<string>(
  MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.value as string)),
);

// de-duplicates and rejects module keys that don't exist
function cleanModules(modules?: string[]) {
  if (!modules) return undefined;
  const unique = [...new Set(modules)];
  const unknown = unique.filter((m) => !VALID_MODULES.has(m));
  if (unknown.length) {
    throw new BadRequestException(`Unknown module(s): ${unknown.join(', ')}`);
  }
  return unique;
}

const withCount = { _count: { select: { staff: true } } } as const;

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
        allowedModules: cleanModules(dto.allowedModules) ?? [],
      },
      include: withCount,
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.staffDesignation.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
      include: withCount, // gives _count.staff
    });
  }

  async findOne(schoolId: string, id: string) {
    const designation = await this.prisma.staffDesignation.findFirst({
      where: { id, schoolId },
      include: withCount,
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

    const allowedModules = cleanModules(dto.allowedModules);

    return this.prisma.staffDesignation.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(allowedModules && { allowedModules }),
      },
      include: withCount,
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
