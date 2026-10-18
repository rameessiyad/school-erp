import { Test, TestingModule } from '@nestjs/testing';
import { StudentImportController } from './student-import.controller';

describe('StudentImportController', () => {
  let controller: StudentImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentImportController],
    }).compile();

    controller = module.get<StudentImportController>(StudentImportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
