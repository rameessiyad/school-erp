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
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@UseGuards(JwtAuthGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('subject')
export class SubjectController {
  constructor(private subjectService: SubjectService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateSubjectDto) {
    return this.subjectService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.subjectService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.subjectService.findOne(req.user.schoolId, id);
  }

  @Get(':id/details')
  findOneWithDetails(@Request() req, @Param('id') id: string) {
    return this.subjectService.findOneWithDetails(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.subjectService.remove(req.user.schoolId, id);
  }
}
