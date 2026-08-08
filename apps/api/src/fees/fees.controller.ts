import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeeStructureService } from './fees.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { Module } from 'src/common/permissions/module.enum';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@Controller('fee-structure')
export class FeeStructureController {
  constructor(private readonly feeStructureService: FeeStructureService) {}

  @Post()
  @RequireModule(Module.STUDENT_FEES)
  create(@Request() req, @Body() dto: CreateFeeStructureDto) {
    return this.feeStructureService.create(req.user.schoolId, dto);
  }

  @Get()
  @RequireModule(Module.STUDENT_FEES)
  findAll(
    @Request() req,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
  ) {
    return this.feeStructureService.findAll(
      req.user.schoolId,
      academicYearId,
      classId,
    );
  }

  @Get(':id')
  @RequireModule(Module.STUDENT_FEES)
  findOne(@Request() req, @Param('id') id: string) {
    return this.feeStructureService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  @RequireModule(Module.STUDENT_FEES)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.feeStructureService.update(req.user.schoolId, id, dto);
  }

  @Patch(':id/deactivate')
  @RequireModule(Module.STUDENT_FEES)
  deactivate(@Request() req, @Param('id') id: string) {
    return this.feeStructureService.deactivate(req.user.schoolId, id);
  }
}
