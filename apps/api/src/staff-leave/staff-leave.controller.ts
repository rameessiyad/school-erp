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
import { StaffLeaveService } from './staff-leave.service';
import { ApplyStaffLeaveDto } from './dto/apply-staff-leave.dto';
import { ReviewStaffLeaveDto } from './dto/review-staff-leave.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-leave')
export class StaffLeaveController {
  constructor(private leaveService: StaffLeaveService) {}

  @Post('apply')
  @Roles(Role.STAFF)
  apply(@Request() req, @Body() dto: ApplyStaffLeaveDto) {
    return this.leaveService.apply(req.user.schoolId, req.user.staffId, dto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN)
  findAll(@Request() req, @Query('status') status?: LeaveStatus) {
    return this.leaveService.findAll(req.user.schoolId, { status });
  }

  @Get('me')
  @Roles(Role.STAFF)
  findMine(@Request() req) {
    return this.leaveService.findMine(req.user.schoolId, req.user.staffId);
  }

  @Patch(':id/review')
  @Roles(Role.SCHOOL_ADMIN)
  review(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ReviewStaffLeaveDto,
  ) {
    return this.leaveService.review(
      req.user.schoolId,
      id,
      req.user.id, // reviewer is the admin — adjust field name to match your JWT payload
      dto,
    );
  }
}
