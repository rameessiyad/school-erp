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
import { ClassService } from './class.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { Module } from 'src/common/permissions/module.enum';
import { Role } from 'generated/prisma/enums';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassDto } from './dto/create-class.dto';

@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Post('create')
  @Roles(Role.SCHOOL_ADMIN)
  create(@Request() req, @Body() dto: CreateClassDto) {
    return this.classService.create(req.user.schoolId, dto);
  }

  @Get()
  @RequireModule(Module.STUDENT_ADMISSIONS)
  findAll(@Request() req) {
    return this.classService.findAll(req.user.schoolId);
  }

  @Get(':id')
  @RequireModule(Module.STUDENT_ADMISSIONS)
  findOne(@Request() req, @Param('id') id: string) {
    return this.classService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Request() req, @Param('id') id: string) {
    return this.classService.remove(req.user.schoolId, id);
  }
}
