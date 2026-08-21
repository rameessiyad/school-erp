import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { LeaveStatus } from 'generated/prisma/enums';
import { TeacherLeaveService } from './teacher-leave.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { ReviewLeaveDto } from './dto/review-leave.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teacher-leave')
export class TeacherLeaveController {
  constructor(private leaveService: TeacherLeaveService) {}

  @Post('apply')
  @Roles(Role.TEACHER)
  apply(@Request() req, @Body() dto: ApplyLeaveDto) {
    return this.leaveService.apply(req.user.schoolId, req.user.teacherId, dto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN)
  findAll(@Request() req, @Query('status') status?: LeaveStatus) {
    return this.leaveService.findAll(req.user.schoolId, { status });
  }

  @Get('me')
  @Roles(Role.TEACHER)
  findMine(@Request() req) {
    return this.leaveService.findMine(req.user.schoolId, req.user.teacherId);
  }

  @Patch(':id/review')
  @Roles(Role.SCHOOL_ADMIN)
  review(@Request() req, @Param('id') id: string, @Body() dto: ReviewLeaveDto) {
    return this.leaveService.review(
      req.user.schoolId,
      id,
      req.user.teacherId,
      dto,
    );
  }
}
