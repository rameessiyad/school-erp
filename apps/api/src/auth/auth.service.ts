import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Module } from 'src/common/permissions/module.enum';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async validateSuperAdminLogin(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: Role.SUPER_ADMIN,
        schoolId: null,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    const payload = {
      sub: user.id,
      schoolId: null,
      role: user.role,
      allowedModules: [],
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

  async validateAdminLogin(schoolId: string, email: string, password: string) {
    const user = await this.usersService.findByEmail(schoolId, email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    let allowedModules: Module[] = [];
    let teacherId: string | undefined;
    let staffId: string | undefined;

    if (user.role === Role.STAFF) {
      const staff = await this.prisma.staff.findUnique({
        where: { userId: user.id },
        include: { designation: true },
      });

      if (!staff) throw new UnauthorizedException('Staff record not found');

      allowedModules = (staff.designation?.allowedModules ?? []) as Module[];
      staffId = staff.id;
    }

    if (user.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher) throw new UnauthorizedException('Teacher record not found');
      teacherId = teacher.id;
    }

    const payload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      allowedModules,
      teacherId,
      staffId,
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
  async requestOtp(schoolId: string, phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { schoolId, phone, role: Role.PARENT },
    });

    if (!user)
      throw new UnauthorizedException(
        'No parent account found for this phone number',
      );
    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${schoolId}:${phone}`;

    await this.redisService.getClient().set(key, otp, 'EX', 300);
    console.log(`OTP for ${phone}: ${otp}`); // TODO: replace with SMS provider

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(schoolId: string, phone: string, otp: string) {
    const key = `otp:${schoolId}:${phone}`;
    const storedOtp = await this.redisService.getClient().get(key);

    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redisService.getClient().del(key);

    const user = await this.prisma.user.findFirst({
      where: { schoolId, phone, role: Role.PARENT },
    });

    if (!user || !user.isActive)
      throw new UnauthorizedException('Account inactive');

    const payload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      allowedModules: [],
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, phone: user.phone, role: user.role },
    };
  }

  async getProfile(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        school: { select: { name: true } },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const profile: {
      id: string;
      email: string | null;
      phone: string | null;
      role: string;
      schoolName: string | null;
      firstName?: string;
      lastName?: string | null;
      designation?: string | null;
    } = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      schoolName: user.school?.name ?? null,
    };

    if (role === Role.STAFF) {
      const staff = await this.prisma.staff.findUnique({
        where: { userId },
        include: { designation: true },
      });

      if (staff) {
        profile.firstName = staff.firstName;
        profile.lastName = staff.lastName;
        profile.designation = staff.designation?.name ?? null;
      }
    }

    return profile;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid)
      throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password updated successfully' };
  }
}
