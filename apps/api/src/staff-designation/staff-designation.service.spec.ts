import { Test, TestingModule } from '@nestjs/testing';
import { StaffDesignationService } from './staff-designation.service';

describe('StaffDesignationService', () => {
  let service: StaffDesignationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffDesignationService],
    }).compile();

    service = module.get<StaffDesignationService>(StaffDesignationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
