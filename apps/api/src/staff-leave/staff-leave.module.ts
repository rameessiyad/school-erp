import { Module } from '@nestjs/common';
import { StaffLeaveService } from './staff-leave.service';
import { StaffLeaveController } from './staff-leave.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StaffLeaveService],
  controllers: [StaffLeaveController],
})
export class StaffLeaveModule {}
