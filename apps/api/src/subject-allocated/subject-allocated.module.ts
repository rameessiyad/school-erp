import { Module } from '@nestjs/common';
import { SubjectsAllocatedService } from './subject-allocated.service';
import { SubjectsAllocatedController } from './subject-allocated.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubjectsAllocatedService],
  controllers: [SubjectsAllocatedController],
})
export class SubjectAllocatedModule {}
