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
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { Module } from 'src/common/permissions/module.enum';
import { UpdateParentDto } from './dto/update-parent.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { ParentService } from './parent.service';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequireModule(Module.PARENT_DETAILS)
@Controller('parent')
export class ParentController {
  constructor(private parentService: ParentService) {}

  @Post('create')
  create(@Request() req, @Body() dto: CreateParentDto) {
    return this.parentService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.parentService.findAll(req.user.schoolId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.parentService.findOne(req.user.schoolId, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentService.update(req.user.schoolId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.parentService.remove(req.user.schoolId, id);
  }
}
