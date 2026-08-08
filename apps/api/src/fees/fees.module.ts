import { Module } from '@nestjs/common';
import { FeeStructureController } from './fees.controller';
import { FeeStructureService } from './fees.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeeStructureController],
  providers: [FeeStructureService],
})
export class FeesModule {}
