import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PromotionService } from './promotion.service';
import { PromoteStudentsDto } from './dto/promote-students.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('academic-year/promotion')
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Get('preview')
  getPreview(
    @Request() req,
    @Query('fromAcademicYearId') fromAcademicYearId: string,
    @Query('toAcademicYearId') toAcademicYearId: string,
  ) {
    return this.promotionService.getPreview(
      req.user.schoolId,
      fromAcademicYearId,
      toAcademicYearId,
    );
  }

  @Post()
  promote(@Request() req, @Body() dto: PromoteStudentsDto) {
    return this.promotionService.promote(req.user.schoolId, dto);
  }
}
