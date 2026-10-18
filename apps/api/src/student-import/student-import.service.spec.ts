import { Test, TestingModule } from '@nestjs/testing';
import { StudentImportService } from './student-import.service';

describe('StudentImportService', () => {
  let service: StudentImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentImportService],
    }).compile();

    service = module.get<StudentImportService>(StudentImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
