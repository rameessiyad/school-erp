import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { SubjectsAllocatedService } from './subject-allocated.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
@Controller('teacher/subjects-allocated')
export class SubjectsAllocatedController {
  constructor(private service: SubjectsAllocatedService) {}

  @Get()
  getAllocations(@Request() req) {
    return this.service.getAllocations(req.user.schoolId, req.user.teacherId);
  }
}
