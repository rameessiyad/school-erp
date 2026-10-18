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
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  QueryAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  // ── Admin only: create / update / delete ──

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  create(@Request() req, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(
      req.user.schoolId,
      req.user.userId, // 👈 check this, see note below
      dto,
    );
  }

  @Patch(':id')
  @Roles(Role.SCHOOL_ADMIN)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  remove(@Request() req, @Param('id') id: string) {
    return this.announcementsService.remove(req.user.schoolId, id);
  }

  // ── Everyone: read (service filters by audience based on role) ──

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.TEACHER, Role.PARENT)
  findAll(@Request() req, @Query() query: QueryAnnouncementDto) {
    return this.announcementsService.findAll(
      req.user.schoolId,
      req.user.role,
      query.category,
    );
  }

  @Get(':id')
  @Roles(Role.SCHOOL_ADMIN, Role.STAFF, Role.TEACHER, Role.PARENT)
  findOne(@Request() req, @Param('id') id: string) {
    return this.announcementsService.findOne(req.user.schoolId, id);
  }
}
