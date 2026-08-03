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
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AcademicYearService } from './academic-year.service';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('academic-year')
export class AcademicYearController {
  constructor(private academicYearService: AcademicYearService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateAcademicYearDto) {
    return this.academicYearService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.academicYearService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.academicYearService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.academicYearService.remove(req.user.schoolId, id);
  }
}
