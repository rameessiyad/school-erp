import { Module } from '@nestjs/common';
import { TeacherLeaveService } from './teacher-leave.service';
import { TeacherLeaveController } from './teacher-leave.controller';

@Module({
  providers: [TeacherLeaveService],
  controllers: [TeacherLeaveController]
})
export class TeacherLeaveModule {}
