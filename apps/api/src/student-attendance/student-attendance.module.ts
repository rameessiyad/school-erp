import { Module } from '@nestjs/common';
import { StudentAttendanceService } from './student-attendance.service';
import { StudentAttendanceController } from './student-attendance.controller';

@Module({
  providers: [StudentAttendanceService],
  controllers: [StudentAttendanceController]
})
export class StudentAttendanceModule {}
