import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ClassService],
  controllers: [ClassController],
})
export class ClassModule {}
