import { Test, TestingModule } from '@nestjs/testing';
import { TeacherLeaveService } from './teacher-leave.service';

describe('TeacherLeaveService', () => {
  let service: TeacherLeaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeacherLeaveService],
    }).compile();

    service = module.get<TeacherLeaveService>(TeacherLeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
