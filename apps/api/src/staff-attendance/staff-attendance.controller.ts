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
import { StaffAttendanceService } from './staff-attendance.service';
import { MarkStaffAttendanceDto } from './dto/mark-staff-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private attendanceService: StaffAttendanceService) {}

  @Post('mark')
  @Roles(Role.STAFF)
  mark(@Request() req, @Body() dto: MarkStaffAttendanceDto) {
    return this.attendanceService.mark(
      req.user.schoolId,
      req.user.staffId,
      dto,
    );
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN)
  findAll(
    @Request() req,
    @Query('staffId') staffId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findAll(req.user.schoolId, {
      staffId,
      from,
      to,
    });
  }

  @Get('me')
  @Roles(Role.STAFF)
  findMine(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findMine(
      req.user.schoolId,
      req.user.staffId,
      {
        from,
        to,
      },
    );
  }

  @Get('by-date')
  @Roles(Role.SCHOOL_ADMIN)
  findAllByDate(@Request() req, @Query('date') date?: string) {
    return this.attendanceService.findAllByDate(req.user.schoolId, date);
  }
}
