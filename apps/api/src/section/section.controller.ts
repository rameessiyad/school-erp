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
import { SectionService } from './section.service';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateSectionDto } from './dto/create-section.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('section')
export class SectionController {
  constructor(private sectionService: SectionService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateSectionDto) {
    return this.sectionService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.sectionService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.sectionService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.sectionService.remove(req.user.schoolId, id);
  }
}
