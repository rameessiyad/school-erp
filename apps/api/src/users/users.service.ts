import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmailOrPhone(schoolId: string, identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        schoolId,
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });
  }

  async findByEmail(schoolId: string, email: string) {
    return this.prisma.user.findFirst({
      where: {
        schoolId,
        email,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { teacher: true, parent: true },
    });
  }
}
