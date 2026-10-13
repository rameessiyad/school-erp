import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';

@Injectable()
export class SuperAdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: SuperAdminLoginDto) {
    // Super admins have schoolId = null, so we filter on that plus the role
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        schoolId: null,
        role: Role.SUPER_ADMIN,
      },
    });

    // Same message for "no user", "wrong password" and "inactive",
    // so the response doesn't reveal which emails exist
    const invalid = new UnauthorizedException('Invalid email or password');

    if (!user || !user.isActive || !user.passwordHash) throw invalid;

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) throw invalid;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      schoolId: null,
    });

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
