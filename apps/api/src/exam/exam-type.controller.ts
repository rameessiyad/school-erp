import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExamTypeService } from './exam-type.service';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';

@UseGuards(JwtAuthGuard)
@Controller('exam/types')
export class ExamTypeController {
  constructor(private examTypeService: ExamTypeService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateExamTypeDto) {
    return this.examTypeService.create(req.user.schoolId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.examTypeService.findAll(req.user.schoolId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.examTypeService.remove(req.user.schoolId, id);
  }
}
