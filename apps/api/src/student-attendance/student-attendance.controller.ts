import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { StudentAttendanceService } from './student-attendance.service';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('student-attendance')
export class StudentAttendanceController {
  constructor(private readonly service: StudentAttendanceService) {}

  @Get('my-class')
  @Roles(Role.TEACHER)
  getMyClassStudents(@Request() req, @Query('date') date: string) {
    return this.service.getMyClassStudents(
      req.user.schoolId,
      req.user.teacherId,
      date,
    );
  }

  @Get('section/:sectionId')
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF)
  getSectionAttendance(
    @Request() req,
    @Param('sectionId') sectionId: string,
    @Query('date') date: string,
  ) {
    return this.service.getSectionAttendance(
      req.user.schoolId,
      sectionId,
      date,
    );
  }

  @Post('mark')
  @Roles(Role.TEACHER)
  markAttendance(@Request() req, @Body() dto: MarkStudentAttendanceDto) {
    return this.service.markAttendance(
      req.user.schoolId,
      req.user.teacherId,
      dto,
    );
  }
}
