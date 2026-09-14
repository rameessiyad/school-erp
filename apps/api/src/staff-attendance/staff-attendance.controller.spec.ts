import { Test, TestingModule } from '@nestjs/testing';
import { StaffAttendanceController } from './staff-attendance.controller';

describe('StaffAttendanceController', () => {
  let controller: StaffAttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffAttendanceController],
    }).compile();

    controller = module.get<StaffAttendanceController>(StaffAttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
