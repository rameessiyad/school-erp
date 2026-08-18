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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UploadedFile as UploadedFileType } from 'src/file-upload/file-upload.service';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { Module } from 'src/common/permissions/module.enum';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentService } from './student.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequireModule(Module.STUDENT_ADMISSIONS)
@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Request() req,
    @Body() dto: CreateStudentDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.studentService.create(req.user.schoolId, dto, photo);
  }

  @Get()
  findAll(@Request() req) {
    return this.studentService.findAll(req.user.schoolId);
  }

  @Get('unassigned')
  findUnassigned(@Request() req) {
    return this.studentService.findUnassigned(req.user.schoolId);
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
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.studentService.update(req.user.schoolId, id, dto, photo);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.studentService.remove(req.user.schoolId, id);
  }

  //   enrollment
  @Post(':id/enrollment/create')
  enroll(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.studentService.enroll(req.user.schoolId, id, dto);
  }

  @Get(':id/enrollment')
  getEnrollment(
    @Request() req,
    @Param('id') id: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.studentService.getEnrollment(
      req.user.schoolId,
      id,
      academicYearId,
    );
  }
}
