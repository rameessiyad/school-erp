import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ModulePermissionGuard } from 'src/auth/guards/module-permission.guard';
import { RequireModule } from 'src/auth/decorators/require-module.decorator';
import { Module } from 'src/common/permissions/module.enum';
import { StudentFeeService } from './student-fee.service';
import { QueryStudentFeeDto } from './dto/query-student-fee.dto';

@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequireModule(Module.STUDENT_FEES)
@Controller('student-fees')
export class StudentFeeController {
  constructor(private readonly studentFeeService: StudentFeeService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: QueryStudentFeeDto) {
    return this.studentFeeService.findAll(req.user.schoolId, query);
  }

  @Get('student/:studentId')
  findByStudent(@Req() req: any, @Param('studentId') studentId: string) {
    return this.studentFeeService.findByStudent(req.user.schoolId, studentId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.studentFeeService.findOne(req.user.schoolId, id);
  }
}
