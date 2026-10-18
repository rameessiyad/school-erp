import { Module } from '@nestjs/common';
import { StudentImportController } from './student-import.controller';
import { StudentImportService } from './student-import.service';

@Module({
  controllers: [StudentImportController],
  providers: [StudentImportService],
})
export class StudentImportModule {}
