import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { SuperAdminService } from './super-admin.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { UpdateSchoolModulesDto } from './dto/update-school-modules.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('super-admin/schools')
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Post('create')
  create(@Body() dto: CreateSchoolDto) {
    return this.superAdminService.createSchool(dto);
  }

  // Keep static routes above ':id' so they aren't swallowed by it
  @Get('modules/available')
  availableModules() {
    return this.superAdminService.getAvailableModules();
  }

  @Get()
  findAll(@Query('status') status?: 'ACTIVE' | 'INACTIVE') {
    return this.superAdminService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.superAdminService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.superAdminService.update(id, dto);
  }

  @Patch(':id/modules')
  updateModules(@Param('id') id: string, @Body() dto: UpdateSchoolModulesDto) {
    return this.superAdminService.updateModules(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.superAdminService.remove(id);
  }
}
