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
import { MyClassService } from './my-class.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/my-class')
export class MyClassController {
  constructor(private myClassService: MyClassService) {}

  @Get()
  getMyClass(@Request() req) {
    return this.myClassService.getMyClass(
      req.user.schoolId,
      req.user.teacherId,
    );
  }

  @Get('students')
  getStudents(@Request() req) {
    return this.myClassService.getMyClassStudents(
      req.user.schoolId,
      req.user.teacherId,
    );
  }

  @Get('attendance')
  getAttendance(@Request() req, @Query('date') date: string) {
    return this.myClassService.getAttendanceForDate(
      req.user.schoolId,
      req.user.teacherId,
      date,
    );
  }

  @Post('attendance')
  markAttendance(@Request() req, @Body() dto: MarkAttendanceDto) {
    return this.myClassService.markAttendance(
      req.user.schoolId,
      req.user.teacherId,
      dto,
    );
  }
}
