import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateAdminLogin(schoolId: string, email: string, password: string) {
    const user = await this.usersService.findByEmail(schoolId, email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    const payload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
