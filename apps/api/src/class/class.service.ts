import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateClassDto) {
    const existing = await this.prisma.class.findFirst({
      where: { schoolId, name: dto.name },
    });
    if (existing) throw new ConflictException('Class already exists');

    const sectionNames = this.normalizeSectionNames(dto.sections);

    let activeYearId: string | undefined;

    if (sectionNames.length > 0) {
      const activeYear = await this.prisma.academicYear.findFirst({
        where: { schoolId, isActive: true },
      });
      if (!activeYear) {
        throw new ConflictException(
          'No active academic year found for this school',
        );
      }
      activeYearId = activeYear.id;
    }

    return this.prisma.class.create({
      data: {
        schoolId,
        name: dto.name,
        ...(sectionNames.length > 0 && {
          sections: {
            create: sectionNames.map((name) => ({
              name,
              school: { connect: { id: schoolId } },
              academicYear: { connect: { id: activeYearId! } },
            })),
          },
        }),
      },
      include: { sections: true },
    });
  }

  private normalizeSectionNames(sections?: string[]): string[] {
    const trimmed = (sections ?? [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return [...new Set(trimmed.map((s) => s.toUpperCase()))];
  }

  async findAll(schoolId: string) {
    const classes = await this.prisma.class.findMany({
      where: { schoolId },
      include: {
        sections: {
          where: { academicYear: { isActive: true } },
          select: {
            id: true,
            name: true,
            _count: { select: { studentEnrollments: true } },
            studentEnrollments: {
              select: {
                student: {
                  select: {
                    enrollments: { select: { parentId: true } },
                  },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return classes.map((cls) => ({
      ...cls,
      sections: cls.sections.map((sec) => {
        const parentIds = new Set<string>();
        sec.studentEnrollments.forEach((e) =>
          e.student.enrollments.forEach((ps) => parentIds.add(ps.parentId)),
        );

        return {
          id: sec.id,
          name: sec.name,
          studentCount: sec._count.studentEnrollments,
          parentCount: parentIds.size,
        };
      }),
    }));
  }

  async findOne(schoolId: string, id: string) {
    const cls = await this.prisma.class.findFirst({
      where: { id, schoolId },
      include: {
        sections: {
          where: { academicYear: { isActive: true } },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async update(schoolId: string, id: string, dto: UpdateClassDto) {
    await this.findOne(schoolId, id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sections, ...classData } = dto;

    return this.prisma.class.update({ where: { id }, data: classData });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    await this.prisma.class.delete({ where: { id } });
    return { message: 'Class deleted successfully' };
  }
}
