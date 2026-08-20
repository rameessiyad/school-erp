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
import { Role } from 'generated/prisma/enums';
import { UploadedFile as UploadedFileType } from 'src/file-upload/file-upload.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @Request() req,
    @Body() dto: CreateStaffDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.staffService.createStaff(req.user.schoolId, dto, photo);
  }

  @Get()
  findAll(@Request() req) {
    return this.staffService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.staffService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.staffService.updateStaff(req.user.schoolId, id, dto, photo);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.staffService.removeStaff(req.user.schoolId, id);
  }
}
