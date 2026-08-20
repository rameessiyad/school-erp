import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teacher-attendance')
export class TeacherAttendanceController {
  constructor(private attendanceService: TeacherAttendanceService) {}

  @Post('mark')
  @Roles(Role.TEACHER)
  mark(@Request() req, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.mark(req.user.schoolId, req.user.userId, dto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN)
  findAll(
    @Request() req,
    @Query('teacherId') teacherId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findAll(req.user.schoolId, {
      teacherId,
      from,
      to,
    });
  }

  @Get('me')
  @Roles(Role.TEACHER)
  findMine(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findMine(req.user.schoolId, req.user.userId, {
      from,
      to,
    });
  }
}
