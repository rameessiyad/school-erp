import { Module } from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { TeacherAttendanceController } from './teacher-attendance.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TeacherAttendanceService],
  controllers: [TeacherAttendanceController],
})
export class TeacherAttendanceModule {}
