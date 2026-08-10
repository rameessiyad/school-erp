import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile as UploadedFileType } from 'src/file-upload/file-upload.service';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('teacher')
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Request() req,
    @Body() dto: CreateTeacherDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.teacherService.create(req.user.schoolId, dto, photo);
  }

  @Get()
  findAll(@Request() req) {
    return this.teacherService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.teacherService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.teacherService.update(req.user.schoolId, id, dto, photo);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.teacherService.remove(req.user.schoolId, id);
  }

  // allocations
  @Post(':id/allocation/create')
  addAllocation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateAllocationDto,
  ) {
    return this.teacherService.addAllocation(req.user.schoolId, id, dto);
  }

  @Get(':id/allocations')
  listAllocations(@Request() req, @Param('id') id: string) {
    return this.teacherService.listAllocations(req.user.schoolId, id);
  }

  @Delete(':id/allocations/:allocationId')
  removeAllocation(
    @Request() req,
    @Param('id') id: string,
    @Param('allocationId') allocationId: string,
  ) {
    return this.teacherService.removeAllocation(
      req.user.schoolId,
      id,
      allocationId,
    );
  }
}
