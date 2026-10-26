import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: {
    sub: string;
    schoolId: string;
    role: string;
    allowedModules?: string[];
    teacherId?: string;
    staffId?: string;
  }) {
    // One query per request: live account status + (for staff) live permissions
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        isActive: true,
        role: true,
        schoolId: true,
        staff: {
          select: {
            id: true,
            isActive: true,
            designation: { select: { allowedModules: true } },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.role === 'STAFF' && !user.staff?.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return {
      userId: payload.sub,
      schoolId: user.schoolId ?? payload.schoolId,
      role: user.role,
      allowedModules:
        user.role === 'STAFF'
          ? (user.staff?.designation?.allowedModules ?? [])
          : (payload.allowedModules ?? []),
      teacherId: payload.teacherId,
      staffId: user.staff?.id ?? payload.staffId,
    };
  }
}
