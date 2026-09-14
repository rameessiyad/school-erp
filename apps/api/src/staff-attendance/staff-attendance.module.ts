import { Module } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendanceController } from './staff-attendance.controller';

@Module({
  providers: [StaffAttendanceService],
  controllers: [StaffAttendanceController],
})
export class StaffAttendanceModule {}
