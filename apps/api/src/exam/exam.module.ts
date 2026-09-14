import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ExamTypeService } from './exam-type.service';
import { ExamTypeController } from './exam-type.controller';

@Module({
  providers: [ExamService, ExamTypeService],
  controllers: [ExamTypeController, ExamController],
})
export class ExamModule {}
