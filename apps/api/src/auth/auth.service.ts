import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Module } from 'src/common/permissions/module.enum';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { getAllowedModules } from 'src/common/permissions/staff-permission.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateAdminLogin(schoolId: string, email: string, password: string) {
    const user = await this.usersService.findByEmail(schoolId, email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    let allowedModules: Module[] = [];

    if (user.role === Role.STAFF) {
      const staff = await this.prisma.staff.findUnique({
        where: { userId: user.id },
      });

      if (!staff) throw new UnauthorizedException('Staff record not found');

      allowedModules = getAllowedModules(staff.designation);
    }

    const payload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      allowedModules,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        allowedModules,
      },
    };
  }
}
