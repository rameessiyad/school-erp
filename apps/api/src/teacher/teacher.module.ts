import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [PrismaModule, FileUploadModule],
  providers: [TeacherService],
  controllers: [TeacherController],
})
export class TeacherModule {}
