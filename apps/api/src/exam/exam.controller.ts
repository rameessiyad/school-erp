import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('exam')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateExamDto) {
    return this.examService.create(req.user.schoolId, dto);
  }

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.TEACHER)
  findAll(@Request() req, @Query('academicYearId') academicYearId?: string) {
    return this.examService.findAll(req.user.schoolId, academicYearId);
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.TEACHER)
  findOne(@Request() req, @Param('id') id: string) {
    return this.examService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.examService.remove(req.user.schoolId, id);
  }
}
