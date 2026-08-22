import { Test, TestingModule } from '@nestjs/testing';
import { SubjectAllocatedController } from './subject-allocated.controller';

describe('SubjectAllocatedController', () => {
  let controller: SubjectAllocatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectAllocatedController],
    }).compile();

    controller = module.get<SubjectAllocatedController>(SubjectAllocatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
