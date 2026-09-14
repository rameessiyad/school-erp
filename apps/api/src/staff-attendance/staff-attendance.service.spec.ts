import { Test, TestingModule } from '@nestjs/testing';
import { StaffAttendanceService } from './staff-attendance.service';

describe('StaffAttendanceService', () => {
  let service: StaffAttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffAttendanceService],
    }).compile();

    service = module.get<StaffAttendanceService>(StaffAttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
