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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateClassDto } from './dto/create-class.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateClassDto) {
    return this.classService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.classService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.classService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.classService.remove(req.user.schoolId, id);
  }
}
