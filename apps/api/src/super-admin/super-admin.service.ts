import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt'; // use 'bcryptjs' if that's what your auth module uses
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { Module } from 'src/common/permissions/module.enum';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { UpdateSchoolModulesDto } from './dto/update-school-modules.dto';

const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'superadmin',
];

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // List of every module the platform has, for the "allowed modules" checkboxes in the UI
  getAvailableModules() {
    return Object.values(Module);
  }

  async createSchool(dto: CreateSchoolDto) {
    const subdomain = dto.subdomain.toLowerCase();
    await this.assertSubdomainAvailable(subdomain);

    const passwordHash = await bcrypt.hash(dto.admin.password, 10);
    const allowedModules = dto.allowedModules?.length
      ? dto.allowedModules
      : Object.values(Module);

    return this.prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: { name: dto.name.trim(), subdomain, allowedModules },
      });

      const admin = await tx.user.create({
        data: {
          schoolId: school.id,
          role: Role.SCHOOL_ADMIN,
          email: dto.admin.email.toLowerCase(),
          phone: dto.admin.phone,
          passwordHash,
        },
        select: { id: true, email: true, phone: true },
      });

      // Default exam types for every new school.
      // Remove this if you already seed these somewhere else.
      await tx.examType.createMany({
        data: [
          { schoolId: school.id, name: 'Model', isDefault: true },
          { schoolId: school.id, name: 'Term', isDefault: true },
        ],
      });

      return { school, admin };
    });
  }

  async findAll(status?: 'ACTIVE' | 'INACTIVE') {
    return this.prisma.school.findMany({
      where: status ? { status } : undefined,
      select: {
        id: true,
        name: true,
        subdomain: true,
        status: true,
        allowedModules: true,
        createdAt: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            parents: true,
            staffs: true,
          },
        },
        users: {
          where: { role: Role.SCHOOL_ADMIN },
          select: { id: true, email: true, phone: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            parents: true,
            staffs: true,
            classes: true,
          },
        },
        academicYears: {
          where: { isActive: true },
          select: { id: true, label: true, startDate: true, endDate: true },
        },
        users: {
          where: { role: Role.SCHOOL_ADMIN },
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
            lastLogin: true,
          },
        },
      },
    });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.ensureExists(id);

    const data: UpdateSchoolDto = { ...dto };
    if (dto.name) data.name = dto.name.trim();
    if (dto.subdomain) {
      data.subdomain = dto.subdomain.toLowerCase();
      await this.assertSubdomainAvailable(data.subdomain, id);
    }

    return this.prisma.school.update({ where: { id }, data });
  }

  async updateModules(id: string, dto: UpdateSchoolModulesDto) {
    await this.ensureExists(id);

    return this.prisma.school.update({
      where: { id },
      data: { allowedModules: dto.allowedModules },
      select: { id: true, name: true, allowedModules: true },
    });
  }

  // Hard delete. Cascades to ALL school data (students, fees, attendance, ...)
  // Prefer setting status = INACTIVE through update() in normal use.
  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.school.delete({ where: { id } });
    return { message: 'School deleted successfully' };
  }

  private async ensureExists(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!school) throw new NotFoundException('School not found');
  }

  private async assertSubdomainAvailable(
    subdomain: string,
    excludeId?: string,
  ) {
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      throw new ConflictException('This subdomain is reserved');
    }
    const existing = await this.prisma.school.findFirst({
      where: { subdomain, ...(excludeId && { NOT: { id: excludeId } }) },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Subdomain already in use');
  }
}
