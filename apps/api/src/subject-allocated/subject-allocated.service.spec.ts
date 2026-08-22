import { Test, TestingModule } from '@nestjs/testing';
import { SubjectAllocatedService } from './subject-allocated.service';

describe('SubjectAllocatedService', () => {
  let service: SubjectAllocatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubjectAllocatedService],
    }).compile();

    service = module.get<SubjectAllocatedService>(SubjectAllocatedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
