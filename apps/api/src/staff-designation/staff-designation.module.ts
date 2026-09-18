import { Module } from '@nestjs/common';
import { StaffDesignationController } from './staff-designation.controller';
import { StaffDesignationService } from './staff-designation.service';

@Module({
  controllers: [StaffDesignationController],
  providers: [StaffDesignationService],
  exports: [StaffDesignationService],
})
export class StaffDesignationModule {}
