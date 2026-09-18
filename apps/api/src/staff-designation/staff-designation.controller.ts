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
import { StaffDesignationService } from './staff-designation.service';
import { CreateStaffDesignationDto } from './dto/create-staff-designation.dto';
import { UpdateStaffDesignationDto } from './dto/update-staff-designation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('staff-designation')
export class StaffDesignationController {
  constructor(private staffDesignationService: StaffDesignationService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateStaffDesignationDto) {
    return this.staffDesignationService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.staffDesignationService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.staffDesignationService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDesignationDto,
  ) {
    return this.staffDesignationService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.staffDesignationService.remove(req.user.schoolId, id);
  }
}
