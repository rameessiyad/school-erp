import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { Module } from 'src/common/permissions/module.enum';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentService } from './student.service';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequireModule(Module.STUDENT_ADMISSIONS)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateStudentDto) {
    return this.studentService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.studentService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.studentService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.studentService.remove(req.user.schoolId, id);
  }
}
