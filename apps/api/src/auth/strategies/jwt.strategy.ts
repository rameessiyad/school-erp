import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
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
  }) {
    return {
      userId: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
      allowedModules: payload.allowedModules ?? [],
      teacherId: payload.teacherId,
    };
  }
}
